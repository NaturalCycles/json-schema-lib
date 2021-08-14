import {
  StringMap,
  _assert,
  _omit,
  _stringMapValues,
  _substringBefore,
  _substringBeforeLast,
} from '@naturalcycles/js-lib'
import * as ts from 'typescript'
import { EnumItem, JsonSchema, ObjectJsonSchema, RefJsonSchema, StringJsonSchema } from './model'

const ignoreRefs = ['Array']

const $schema = 'http://json-schema.org/draft-07/schema#'

/**
 * It accepts multiple files to be able to do multiple passes
 * to be able to generate "by-product schemas" such as *Partial, *Required.
 */
export function tsFilesToJsonSchemas(
  files: { fileString: string; fileName: string }[],
): JsonSchema[] {
  const schemaMap: StringMap<JsonSchema> = {}
  const secondPassSchemas: string[] = []

  files.forEach(f => {
    try {
      const g = new TSToJSONSchemaGenerator()
      const { schemas, secondPassSchemas: newSecondPassSchemas } = g.run(f.fileString, f.fileName)

      secondPassSchemas.push(...newSecondPassSchemas)

      schemas.forEach(s => {
        if (schemaMap[s.$id!]) {
          console.warn(
            `!!! ${s.$id} duplicated in ${f.fileName}, it will override previous schema with same $id`,
          )
        }
        schemaMap[s.$id!] = s
      })
    } catch (err) {
      console.log(`${f.fileName} ts parse error:`, err)
    }
  })

  // Let's do a second pass to process Partial/Required schemas

  secondPassSchemas
    .filter(s => s.endsWith('Partial'))
    .forEach(name => {
      const originalName = _substringBeforeLast(name, 'Partial')
      const originalSchema = schemaMap[$idToRef(originalName)] as ObjectJsonSchema
      _assert(originalSchema, `${originalName} schema not found to generate ${name}`)

      const s: ObjectJsonSchema = {
        ...originalSchema,
        $id: $idToRef(name),
        required: [], // Apply Partial effect
      }

      schemaMap[s.$id!] = s
    })

  secondPassSchemas
    .filter(s => s.endsWith('Required'))
    .forEach(name => {
      const originalName = _substringBeforeLast(name, 'Required')
      const originalSchema = schemaMap[$idToRef(originalName)] as ObjectJsonSchema
      _assert(originalSchema, `${originalName} schema not found to generate ${name}`)

      const s: ObjectJsonSchema = {
        ...originalSchema,
        $id: $idToRef(name),
      }

      // Apply Required effect
      s.required = Object.keys(s.properties || {})

      schemaMap[s.$id!] = s
    })

  return _stringMapValues(schemaMap)
}

/**
 * It is implemented as Class with internal state,
 * because "internal state" is needed, e.g to produce
 * "by-product schemas" such as *Partial, *Required.
 */
class TSToJSONSchemaGenerator {
  private secondPassSchemas = new Set<string>()
  private file!: ts.SourceFile

  run(
    fileString: string,
    fileName: string,
  ): { schemas: JsonSchema[]; secondPassSchemas: string[] } {
    this.file = ts.createSourceFile(fileName, fileString, ts.ScriptTarget.Latest)

    const schemas: JsonSchema[] = []

    this.file.forEachChild(n => {
      if (ts.isInterfaceDeclaration(n) || ts.isClassDeclaration(n)) {
        // todo: DRY it (currently index properties are broken here)
        const props: JsonSchema[] = n.members.map(n => this.nodeToJsonSchema(n)!).filter(Boolean)

        const s: ObjectJsonSchema = {
          $id: $idToRef(n.name!.text),
          type: 'object',
          properties: Object.fromEntries(
            props.map(p => [p.$id, _omit(p, ['$id', 'requiredField'])]),
          ),
          required: props.filter(p => p.requiredField).map(p => p.$id!),
          additionalProperties: false,
        }

        processJsdoc(n, s)

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
          ...this.typeNodeToJsonSchema(n.type),
        }

        processJsdoc(n, s)

        schemas.push(s)
      } else if (ts.isEnumDeclaration(n)) {
        const enumItems: EnumItem[] = n.members.map(m => {
          _assert(ts.isIdentifier(m.name), `enum name !isIdentifier`)
          const k = m.name.text

          _assert(m.initializer, `no enum initializer! ${k}`)

          let v

          if (ts.isNumericLiteral(m.initializer) || ts.isPrefixUnaryExpression(m.initializer)) {
            v = Number(m.initializer.getFullText(this.file))
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

    return {
      schemas: schemas.map(s => ({
        $schema,
        ...s,
      })),
      secondPassSchemas: [...this.secondPassSchemas],
    }
  }

  private nodeToJsonSchema(n: ts.Node): JsonSchema | undefined {
    if (
      (!ts.isPropertySignature(n) && !ts.isPropertyDeclaration(n) && !ts.isGetAccessor(n)) ||
      !n.type
    ) {
      return
    }

    const schema = this.typeNodeToJsonSchema(n.type)

    if (!n.questionToken) schema.requiredField = true

    if ((n.name as ts.Identifier)?.text !== undefined) {
      schema.$id = (n.name as ts.Identifier).text
    }

    // console.log(schema)

    processJsdoc(n, schema)

    return schema
  }

  // Here we should get "type" of jsonSchema
  private typeNodeToJsonSchema(type: ts.TypeNode): JsonSchema {
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
        oneOf: type.types.map(t => this.typeNodeToJsonSchema(t)),
      }
    }

    // Intersection type (A & B)
    if (ts.isIntersectionTypeNode(type)) {
      return {
        allOf: type.types.map(t => this.typeNodeToJsonSchema(t)),
      }
    }

    // Parenthesized type
    if (ts.isParenthesizedTypeNode(type)) {
      return this.typeNodeToJsonSchema(type.type)
    }

    // Array type
    if (ts.isArrayTypeNode(type)) {
      return {
        type: 'array',
        items: this.typeNodeToJsonSchema(type.elementType),
      }
    }

    // Tuple type
    if (ts.isTupleTypeNode(type)) {
      const items = type.elements.map(n => this.typeNodeToJsonSchema(n))
      return {
        type: 'array',
        items,
        minItems: items.length,
        maxItems: items.length,
      }
    }

    // Object type (literal)
    if (ts.isTypeLiteralNode(type)) {
      const props = type.members.map(n => this.nodeToJsonSchema(n)!).filter(Boolean)

      const s: ObjectJsonSchema = {
        type: 'object',
        properties: Object.fromEntries(
          props.filter(p => p.$id).map(p => [p.$id, _omit(p, ['$id', 'requiredField'])]),
        ),
        required: props.filter(p => p.requiredField && p.$id).map(p => p.$id!),
        additionalProperties: false,
      }

      const indexSignature = type.members.find(n => ts.isIndexSignatureDeclaration(n)) as
        | ts.IndexSignatureDeclaration
        | undefined
      if (indexSignature) {
        // Currently keyType is not used, but `string` is assumed
        const valueType = this.typeNodeToJsonSchema(indexSignature.type)

        // Removing declared properties to fix ajv strict compilation error:
        // property X matches pattern .* (use allowMatchingProperties)
        s.properties = {}
        s.patternProperties = {
          '.*': valueType,
        }
      }

      return s
    }

    // Object type (reference)
    // Can also be Partial<T>, Required<T>,
    // Record<string, number>
    if (ts.isTypeReferenceNode(type)) {
      // Can be StringMap
      const typeName = (type.typeName as ts.Identifier).text

      if (typeName === 'Record') {
        // Currently keyType is not used, but `string` is assumed
        // const keyType = this.typeNodeToJsonSchema(type.typeArguments![0]!)
        const valueType = this.typeNodeToJsonSchema(type.typeArguments![1]!)

        return {
          type: 'object',
          additionalProperties: false,
          required: [],
          patternProperties: {
            '.*': valueType,
          },
          // Currently keyType is not used, but `string` is assumed
          // propertyNames: {
          //   type: 'string',
          //   pattern: "^[A-Za-z_][A-Za-z0-9_]*$"
          // }
        }
      }

      if (typeName === 'StringMap') {
        const valueType: JsonSchema = type.typeArguments?.length
          ? this.typeNodeToJsonSchema(type.typeArguments[0]!)
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
        const s = this.typeNodeToJsonSchema(valueType) as RefJsonSchema
        _assert(s.$ref, 'We only support Partial for $ref schemas')

        const partialSchemaName = $refToId(s.$ref) + 'Partial'
        this.secondPassSchemas.add(partialSchemaName)

        s.$ref = $idToRef(partialSchemaName)
        return s
      }

      if (typeName === 'Required') {
        const valueType = type.typeArguments![0]!
        const s = this.typeNodeToJsonSchema(valueType) as RefJsonSchema
        _assert(s.$ref, 'We only support Required for $ref schemas')

        const requiredSchemaName = $refToId(s.$ref) + 'Required'
        this.secondPassSchemas.add(requiredSchemaName)

        s.$ref = $idToRef(requiredSchemaName)
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
          const: Boolean(type.literal.getText(this.file)),
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
      console.log(type.getFullText(this.file))
    } catch {}
    throw new Error(`unknown type kind: ${type.kind}`)
  }
}

function _assertIsString(s: any, name = 'value'): asserts s is string {
  _assert(typeof s === 'string' && s, `${name} must be non-empty string`)
}

const stringTags = [
  // string
  'pattern',
  'format',
]

const numberTags = [
  // string
  'minLength',
  'maxLength',
  // number, integer
  'multipleOf',
  'minimum',
  'exclusiveMinimum',
  'maximum',
  'exclusiveMaximum',
  // object
  'minProperties',
  'maxProperties',
  // array
  'minItems',
  'maxItems',
]

const booleanTags = [
  // general
  'deprecated',
  'readOnly',
  'writeOnly',
  // object
  'additionalProperties',
  // array
  'uniqueItems',
]

const jsonTags = [
  // object
  'dependencies',
  'dependentRequired',
  'dependentSchemas',
  'if',
  'then',
  'else',
]

/**
 * Processes jsdoc tags, mutates the schema as needed.
 */
function processJsdoc(n: ts.Node, s: JsonSchema): void {
  if (!(n as any).jsDoc?.length) return

  const jsdoc: ts.JSDoc = (n as any).jsDoc[0]

  if (jsdoc.comment) {
    s.description = jsdoc.comment as string
  }

  jsdoc.tags?.forEach(tag => {
    const { comment } = tag
    const tagNameText = tag.tagName.text

    if (tagNameText === 'validationType') {
      if (comment === 'integer') {
        s.type = comment
      }
    } else if (booleanTags.includes(tagNameText)) {
      s[tagNameText] = comment !== 'false'
    } else if (stringTags.includes(tagNameText)) {
      _assertIsString(comment)
      s[tagNameText] = comment
    } else if (numberTags.includes(tagNameText)) {
      _assertIsString(comment)
      s[tagNameText] = Number(comment)
    } else if (jsonTags.includes(tagNameText)) {
      _assertIsString(comment)
      s[tagNameText] = JSON.parse(comment)
    } else if (tagNameText === 'propertyNames') {
      _assertIsString(comment)
      ;(s as ObjectJsonSchema).propertyNames = {
        type: 'string',
        pattern: comment,
      }
    } else if (tagNameText === 'default') {
      _assertIsString(comment)

      if (s.type === 'number') {
        s.default = Number(comment)
      } else if (s.type === 'integer') {
        s.default = parseInt(comment)
      } else if (s.type === 'boolean') {
        s.default = comment === 'true'
      } else if (s.type === 'string') {
        s.default = comment
      } else {
        s.default = JSON.parse(comment)
      }
    } else if (tagNameText === 'trim') {
      ;(s as StringJsonSchema).transform ||= []
      ;(s as StringJsonSchema).transform!.push('trim')
    } else if (tagNameText === 'toLowerCase') {
      ;(s as StringJsonSchema).transform ||= []
      ;(s as StringJsonSchema).transform!.push('toLowerCase')
    } else if (tagNameText === 'toUpperCase') {
      ;(s as StringJsonSchema).transform ||= []
      ;(s as StringJsonSchema).transform!.push('toUpperCase')
    }
  })
}

function $idToRef($id: string): string {
  return `${$id}.schema.json`
}

function $refToId($ref: string): string {
  return _substringBefore($ref, '.schema.json')
}
