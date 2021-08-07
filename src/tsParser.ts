import { _assert, _filterNullishValues } from '@naturalcycles/js-lib'
import { requireFileToExist } from '@naturalcycles/nodejs-lib'
import * as fs from 'fs-extra'
import * as ts from 'typescript'
import { CommonObjectType, CommonType, CommonTypeName, EnumItem, PrimitiveTypes } from './model'

const typeMap: Partial<Record<ts.SyntaxKind, CommonTypeName>> = {
  [ts.SyntaxKind.StringKeyword]: 'string',
  [ts.SyntaxKind.NumberKeyword]: 'number',
  [ts.SyntaxKind.BooleanKeyword]: 'boolean',
  // [ts.SyntaxKind.ArrayType]: 'array',
  // [ts.SyntaxKind.TypeLiteral]: 'object',
  // [ts.SyntaxKind.TypeReference]: 'object',
}

export function tsParseSourceFile(file: ts.SourceFile): CommonObjectType[] {
  const types: CommonObjectType[] = []

  file.forEachChild(n => {
    if (ts.isInterfaceDeclaration(n)) {
      const properties: CommonObjectType[] = n.members
        .map(n => {
          return parseNodeAsCommonType(n) as CommonObjectType
        })
        .filter(Boolean)

      const t: CommonObjectType = {
        name: n.name.text,
        type: 'object',
        properties,
        ...parseJsdoc(n),
      }

      if (n.heritageClauses?.length) {
        t.extends = n.heritageClauses[0]!.types.map(tt => (tt.expression as any).text).filter(
          Boolean,
        )
      }

      types.push(t)
    } else if (ts.isTypeAliasDeclaration(n)) {
      const type = typeNodeToCommonType(n.type) as string | string[]

      const t: CommonObjectType = {
        name: n.name.text,
        type,
        ...parseJsdoc(n),
      }

      types.push(t)
    } else if (ts.isEnumDeclaration(n)) {
      const enumItems: EnumItem[] = n.members.map(m => {
        _assert(ts.isIdentifier(m.name), `enum name !isIdentifier`)
        const k = m.name.text

        _assert(m.initializer, `no enum initializer! ${k}`)

        const v = m.initializer.getFullText(file)

        return {
          k,
          v:
            ts.isNumericLiteral(m.initializer) || ts.isPrefixUnaryExpression(m.initializer)
              ? Number(v)
              : v,
        }
      })

      types.push({
        name: n.name.text,
        type: 'enum',
        enumItems,
      })
    }
  })

  return types
}

function typeNodeToCommonType(type: ts.TypeNode): CommonType | CommonType[] {
  const t: CommonType | CommonType[] | undefined = typeMap[type.kind]

  if (t) return t

  // Union type
  if (ts.isUnionTypeNode(type)) {
    return type.types.map(t => typeNodeToCommonType(t) as string)
  }

  // Parenthesized type
  if (ts.isParenthesizedTypeNode(type)) {
    return typeNodeToCommonType(type.type)
  }

  // null type
  if (ts.isLiteralTypeNode(type) && type.literal.kind === ts.SyntaxKind.NullKeyword) {
    return 'null'
  }

  // Array type
  if (ts.isArrayTypeNode(type)) {
    return {
      type: 'array',
      arrayOfType: typeNodeToCommonType(type.elementType),
    }
  }

  // Object type (literal)
  if (ts.isTypeLiteralNode(type)) {
    return {
      type: 'object',
      properties: type.members
        .map(n => {
          return parseNodeAsCommonType(n) as CommonObjectType
        })
        .filter(Boolean),
    }
  }

  // Object type (reference)
  if (ts.isTypeReferenceNode(type)) {
    // Can be StringMap
    const typeName = (type.typeName as ts.Identifier).text

    if (typeName === 'StringMap') {
      return {
        type: 'StringMap',
        stringMapOfType: type.typeArguments?.length
          ? typeNodeToCommonType(type.typeArguments[0]!)
          : 'string',
      }
    }

    return typeName
  }

  if (ts.isTupleTypeNode(type)) {
    return {
      type: 'tuple',
      tupleTypes: type.elements.map(n => typeNodeToCommonType(n) as CommonType),
    }
  }

  throw new Error(`unknown type kind: ${type.kind}`)
}

function isCommonObjectType(type: any): type is CommonObjectType {
  return typeof type === 'object' && !Array.isArray(type)
}

// function isCommonUnionType(type: any): type is CommonType[] {
//   return Array.isArray(type)
// }

export function parseNodeAsCommonType(n: ts.Node): CommonObjectType | CommonTypeName | undefined {
  // Find PropertySignature (kind 163)
  if (!ts.isPropertySignature(n) || !n.type) return

  const type = typeNodeToCommonType(n.type)

  const field = isCommonObjectType(type)
    ? type
    : ({
        type,
      } as CommonObjectType)

  if (!n.questionToken) field.required = true

  if (ts.isIdentifier(n.name)) {
    field.name = n.name.text
  }

  // if (ts.isArrayTypeNode(n.type)) {
  //   // field.arrayOfType = parseArrayNode(n.type)
  //   field.arrayOfType = typeNodeToCommonType(n.type!.elementType)
  // } else if (ts.isTypeLiteralNode(n.type)) {
  //   field.properties = n.type.members.map(n => {
  //     return parseNodeAsCommonType(n) as CommonObjectType
  //   }).filter(Boolean)
  // } else if (ts.isTypeReferenceNode(n.type)) {
  //   field.type = (n.type.typeName as ts.Identifier).text
  // }

  Object.assign(field, parseJsdoc(n))

  return _filterNullishValues(field)
}

function parseJsdoc(n: ts.Node): Partial<CommonObjectType> {
  const field: Partial<CommonObjectType> = {}

  if ((n as any).jsDoc?.length) {
    const jsdoc: ts.JSDoc = (n as any).jsDoc[0]

    if (jsdoc.comment) {
      field.descr = jsdoc.comment as string
    }

    if (jsdoc.tags) {
      const typeTag = jsdoc.tags.find(t => t.tagName.text === 'validationType')
      if (typeTag) {
        field.validationType = typeTag.comment as string
      }

      if (jsdoc.tags.some(t => t.tagName.text === 'additionalProperties')) {
        field.additionalProperties = true
      }
    }
  }

  return field
}

export function parseArrayNode(n: ts.ArrayTypeNode): CommonType | CommonType[] {
  let arrayOfType: CommonType | CommonType[]

  const type = typeMap[n.elementType.kind]!

  if (ts.isArrayTypeNode(n.elementType)) {
    // We need to go deeper!
    arrayOfType = {
      type: 'array',
      arrayOfType: parseArrayNode(n.elementType),
    }
  } else if (PrimitiveTypes.has(type)) {
    arrayOfType = type
  } else {
    arrayOfType = {
      type,
    }
  }

  return arrayOfType
}

// Used mostly for debugging now
export function tsParseFiles(filePaths: string[]): CommonObjectType[] {
  const types: CommonObjectType[] = []

  filePaths.forEach(filePath => {
    requireFileToExist(filePath)

    const node = ts.createSourceFile(
      filePath,
      fs.readFileSync(filePath, 'utf8'),
      ts.ScriptTarget.Latest,
    )

    types.push(...tsParseSourceFile(node))
  })

  return types
}

export function tsParseFile(filePath: string): CommonObjectType[] {
  requireFileToExist(filePath)

  const node = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
  )

  return tsParseSourceFile(node)
}
