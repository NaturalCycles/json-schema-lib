import {
  JsonSchema,
  JsonSchemaAllOf,
  JsonSchemaArray,
  JsonSchemaBoolean,
  JsonSchemaConst,
  JsonSchemaEnum,
  JsonSchemaNull,
  JsonSchemaNumber,
  JsonSchemaObject,
  JsonSchemaOneOf,
  JsonSchemaRef,
  JsonSchemaString,
} from '@naturalcycles/js-lib'

export function isRefSchema(s: JsonSchema): s is JsonSchemaRef {
  return '$ref' in s
}

export function isObjectSchema(s: JsonSchema): s is JsonSchemaObject {
  return s.type === 'object'
}

export function isArraySchema(s: JsonSchema): s is JsonSchemaArray {
  return s.type === 'array'
}

export function isStringSchema(s: JsonSchema): s is JsonSchemaString {
  return s.type === 'string'
}

export function isNumberSchema(s: JsonSchema): s is JsonSchemaNumber {
  return s.type === 'number' || s.type === 'integer'
}

export function isBooleanSchema(s: JsonSchema): s is JsonSchemaBoolean {
  return s.type === 'boolean'
}

export function isNullSchema(s: JsonSchema): s is JsonSchemaNull {
  return s.type === 'null'
}

export function isConstSchema(s: JsonSchema): s is JsonSchemaConst {
  return 'const' in s
}

export function isEnumSchema(s: JsonSchema): s is JsonSchemaEnum {
  return 'enum' in s
}

export function isUnionSchema(s: JsonSchema): s is JsonSchemaOneOf {
  return 'oneOf' in s
}

export function isIntersectionSchema(s: JsonSchema): s is JsonSchemaAllOf {
  return 'allOf' in s
}
