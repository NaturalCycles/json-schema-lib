import { StringMap, _assert, _omit, _substringBefore } from '@naturalcycles/js-lib'
import * as ts from 'typescript'

interface EnumItem<T extends string | number = string | number> {
  k: string
  v: T
}

export interface BaseJsonSchema {
  $schema?: string
  $id?: string
  title?: string
  description?: string
  // $comment?: string
  // nullable?: boolean // not sure about that field

  /**
   * This is a temporary "intermediate AST" field that is used inside the parser.
   * In the final schema this field will NOT be present.
   */
  requiredField?: boolean
}

export interface CombinationJsonSchema extends BaseJsonSchema {
  // union type
  oneOf?: JsonSchema[]
  // intersection type
  allOf?: JsonSchema[]
  // other types
  anyOf?: JsonSchema[]
  not?: JsonSchema
}

export interface ConstJsonSchema extends BaseJsonSchema {
  const: string | number | boolean // literal type
}

export interface StringJsonSchema extends BaseJsonSchema {
  type: 'string'
  pattern?: string
}

export interface NumberJsonSchema extends BaseJsonSchema {
  type: 'number'
}

export interface IntegerJsonSchema extends BaseJsonSchema {
  type: 'integer'
}

export interface BooleanJsonSchema extends BaseJsonSchema {
  type: 'boolean'
}

export interface NullJsonSchema extends BaseJsonSchema {
  type: 'null'
}

export interface EnumJsonSchema extends BaseJsonSchema {
  enum: (string | number)[]
}

export interface RefJsonSchema extends BaseJsonSchema {
  $ref: string
}

export interface ObjectJsonSchema extends BaseJsonSchema {
  type: 'object'
  properties?: StringMap<JsonSchema>
  // let's be strict and require all these
  required: string[]
  additionalProperties: boolean

  // StringMap
  patternProperties?: StringMap<JsonSchema>
  propertyNames?: JsonSchema
}

export interface ArrayJsonSchema extends BaseJsonSchema {
  type: 'array'
  items: JsonSchema
  minItems?: number
  maxItems?: number
}

export interface TupleJsonSchema extends BaseJsonSchema {
  type: 'array'
  items: JsonSchema[]
  minItems: number
  maxItems: number
}

export type JsonSchema =
  | BaseJsonSchema
  | CombinationJsonSchema
  | RefJsonSchema
  | ConstJsonSchema
  | EnumJsonSchema
  | StringJsonSchema
  | NumberJsonSchema
  | IntegerJsonSchema
  | BooleanJsonSchema
  | NullJsonSchema
  | ObjectJsonSchema
  | ArrayJsonSchema
  | TupleJsonSchema

const ignoreRefs = ['Array']

const $schema = 'http://json-schema.org/draft-07/schema#'

export function tsFileToJsonSchemas(
  fileString: string,
  fileName = 'anonymousFileName',
): JsonSchema[] {
  const schemas = tsFileToJsonSchemasPass(fileString, fileName)

  // todo: Find all Partial/Required schemas

  return schemas
}

function tsFileToJsonSchemasPass(fileString: string, fileName = 'anonymousFileName'): JsonSchema[] {
  const file = ts.createSourceFile(fileName, fileString, ts.ScriptTarget.Latest)

  const schemas: JsonSchema[] = []

  file.forEachChild(n => {
    if (ts.isInterfaceDeclaration(n) || ts.isClassDeclaration(n)) {
      const props: JsonSchema[] = n.members.map(n => nodeToJsonSchema(n, file)!).filter(Boolean)

      const s: ObjectJsonSchema = {
        $id: $idToRef(n.name!.text),
        type: 'object',
        properties: Object.fromEntries(props.map(p => [p.$id, _omit(p, ['$id', 'requiredField'])])),
        required: props.filter(p => p.requiredField).map(p => p.$id!),
        additionalProperties: false,
        ...parseJsdoc(n),
      }

      if (n.heritageClauses?.length) {
        const otherSchemas = n.heritageClauses[0]!.types.map(
          tt => (tt.expression as any).text as string,
        )
          .filter(Boolean)
          .filter(id => !ignoreRefs.includes(id))
          .map($id => ({ $ref: $idToRef($id) }))

        if (!otherSchemas.length) {
          schemas.push(s)
        } else {
          schemas.push({
            $id: s.$id,
            allOf: [_omit(s, ['$id']), ...otherSchemas],
          })
        }
      } else {
        schemas.push(s)
      }
    } else if (ts.isTypeAliasDeclaration(n)) {
      const s: JsonSchema = {
        $id: $idToRef(n.name.text),
        ...typeNodeToJsonSchema(n.type, file),
        ...parseJsdoc(n),
      }

      schemas.push(s)
    } else if (ts.isEnumDeclaration(n)) {
      const enumItems: EnumItem[] = n.members.map(m => {
        _assert(ts.isIdentifier(m.name), `enum name !isIdentifier`)
        const k = m.name.text

        _assert(m.initializer, `no enum initializer! ${k}`)

        let v

        if (ts.isNumericLiteral(m.initializer) || ts.isPrefixUnaryExpression(m.initializer)) {
          v = Number(m.initializer.getFullText(file))
        } else if (ts.isStringLiteral(m.initializer)) {
          v = m.initializer.text
        } else {
          console.log(m.initializer)
          throw new Error(`unknown enum initializer type`)
        }

        return {
          k,
          v,
        }
      })

      schemas.push({
        $id: $idToRef(n.name.text),
        // We currently only include values
        enum: enumItems.map(e => e.v),
      })
    }
  })

  return schemas.map(s => ({
    $schema,
    ...s,
  }))
}

// Here we should get: name of the property, required-ness
export function nodeToJsonSchema(n: ts.Node, file: ts.SourceFile): JsonSchema | undefined {
  // Find PropertySignature (kind 163)
  if (
    (!ts.isPropertySignature(n) && !ts.isPropertyDeclaration(n) && !ts.isGetAccessor(n)) ||
    !n.type
  )
    return

  const schema = typeNodeToJsonSchema(n.type, file)

  if (!n.questionToken) schema.requiredField = true

  if ((n.name as ts.Identifier).text !== undefined) {
    schema.$id = (n.name as ts.Identifier).text
  }

  // console.log(schema)

  Object.assign(schema, parseJsdoc(n))

  return schema
}

// Here we should get "type" of jsonSchema
function typeNodeToJsonSchema(type: ts.TypeNode, file: ts.SourceFile): JsonSchema {
  if (type.kind === ts.SyntaxKind.StringKeyword) {
    // todo: extra properties?
    return { type: 'string' }
  } else if (type.kind === ts.SyntaxKind.NumberKeyword) {
    return { type: 'number' }
  } else if (type.kind === ts.SyntaxKind.BooleanKeyword) {
    return { type: 'boolean' }
  }

  // Union type (A || B)
  if (ts.isUnionTypeNode(type)) {
    return {
      oneOf: type.types.map(t => typeNodeToJsonSchema(t, file)),
    }
  }

  // Intersection type (A & B)
  if (ts.isIntersectionTypeNode(type)) {
    return {
      allOf: type.types.map(t => typeNodeToJsonSchema(t, file)),
    }
  }

  // Parenthesized type
  if (ts.isParenthesizedTypeNode(type)) {
    return typeNodeToJsonSchema(type.type, file)
  }

  // Array type
  if (ts.isArrayTypeNode(type)) {
    return {
      type: 'array',
      items: typeNodeToJsonSchema(type.elementType, file),
    }
  }

  // Tuple type
  if (ts.isTupleTypeNode(type)) {
    const items = type.elements.map(n => typeNodeToJsonSchema(n, file))
    return {
      type: 'array',
      items,
      minItems: items.length,
      maxItems: items.length,
    }
  }

  // Object type (literal)
  if (ts.isTypeLiteralNode(type)) {
    const props = type.members.map(n => nodeToJsonSchema(n, file)!).filter(Boolean)

    return {
      type: 'object',
      properties: Object.fromEntries(props.map(p => [p.$id, _omit(p, ['$id', 'requiredField'])])),
      required: props.filter(p => p.requiredField).map(p => p.$id!),
      additionalProperties: false,
    }
  }

  // Object type (reference)
  // Can also be Partial<T>, Required<T>, etc
  if (ts.isTypeReferenceNode(type)) {
    // Can be StringMap
    const typeName = (type.typeName as ts.Identifier).text

    if (typeName === 'StringMap') {
      const valueType: JsonSchema = type.typeArguments?.length
        ? typeNodeToJsonSchema(type.typeArguments[0]!, file)
        : { type: 'string' }

      return {
        type: 'object',
        additionalProperties: false,
        required: [],
        patternProperties: {
          '.*': valueType,
        },
      }
    }

    if (typeName === 'Partial') {
      const valueType = type.typeArguments![0]!
      const s = typeNodeToJsonSchema(valueType, file) as RefJsonSchema
      _assert(s.$ref, 'We only support Partial for $ref schemas')
      s.$ref = $idToRef($refToId(s.$ref) + 'Partial')
      // todo: need to generate ${x}Partial schema in 2nd pass
      return s
    }

    if (typeName === 'Required') {
      const valueType = type.typeArguments![0]!
      const s = typeNodeToJsonSchema(valueType, file) as RefJsonSchema
      _assert(s.$ref, 'We only support Required for $ref schemas')
      s.$ref = $idToRef($refToId(s.$ref) + 'Required')
      // todo: need to generate ${x}Required schema in 2nd pass
      return s
    }

    return {
      $ref: $idToRef(typeName),
    }
  }

  // Literal type
  if (ts.isLiteralTypeNode(type)) {
    // e.g `someType: 'literal string'`
    if (ts.isStringLiteral(type.literal)) {
      return {
        const: type.literal.text,
      }
    } else if (ts.isNumericLiteral(type.literal)) {
      return {
        const: Number(type.literal.text),
      }
    } else if (
      type.literal.kind === ts.SyntaxKind.TrueKeyword ||
      type.literal.kind === ts.SyntaxKind.FalseKeyword
    ) {
      return {
        const: Boolean(type.literal.getText(file)),
      }
    } else if (type.literal.kind === ts.SyntaxKind.NullKeyword) {
      return {
        type: 'null',
      }
    } else {
      console.log(`unknown literal type`, type.literal)
      throw new Error(`unknown literal type (see above)`)
    }
  }

  // any
  if (type.kind === ts.SyntaxKind.AnyKeyword) {
    return {
      // description: 'any',
    } // schema matching "anything"
  }

  console.log(type)
  try {
    console.log(type.getFullText(file))
  } catch {}
  throw new Error(`unknown type kind: ${type.kind}`)
}

function parseJsdoc<T extends JsonSchema>(n: ts.Node): Partial<T> {
  if (!(n as any).jsDoc?.length) return {}

  const s: Partial<T> = {}

  const jsdoc: ts.JSDoc = (n as any).jsDoc[0]

  if (jsdoc.comment) {
    s.description = jsdoc.comment as string
  }

  if (jsdoc.tags) {
    const typeTag = jsdoc.tags.find(t => t.tagName.text === 'validationType')
    if (typeTag) {
      // todo: add validationType features here
      const validationType = typeTag.comment as string
      if (validationType === 'integer') {
        ;(s as any).type = validationType
      }
    }

    if (jsdoc.tags.some(t => t.tagName.text === 'additionalProperties')) {
      ;(s as any).additionalProperties = true
    }
  }

  return s
}

function $idToRef($id: string): string {
  return `${$id}.schema.json`
}

function $refToId($ref: string): string {
  return _substringBefore($ref, '.schema.json')
}
