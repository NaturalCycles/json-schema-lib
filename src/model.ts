import { StringMap } from '@naturalcycles/js-lib'

export interface EnumItem<T extends string | number = string | number> {
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
  deprecated?: boolean
  readOnly?: boolean
  writeOnly?: boolean

  type?: string

  default?: any

  // union type
  oneOf?: JsonSchema[]
  // intersection type
  allOf?: JsonSchema[]
  // other types
  anyOf?: JsonSchema[]
  not?: JsonSchema

  // https://json-schema.org/understanding-json-schema/reference/conditionals.html#id6
  if?: JsonSchema
  then?: JsonSchema
  else?: JsonSchema

  /**
   * This is a temporary "intermediate AST" field that is used inside the parser.
   * In the final schema this field will NOT be present.
   */
  requiredField?: boolean
}

/**
 * To be used in Union type
 */
export interface RootJsonSchema {
  $schema: string
  $id: string
}

export interface ConstJsonSchema extends BaseJsonSchema {
  const: string | number | boolean // literal type
}

export interface StringJsonSchema extends BaseJsonSchema {
  type: 'string'
  pattern?: string
  minLength?: number
  maxLength?: number
  format?: string

  contentMediaType?: string
  contentEncoding?: string // e.g 'base64'

  /**
   * https://ajv.js.org/packages/ajv-keywords.html#transform
   */
  transform?: ('trim' | 'toLowerCase' | 'toUpperCase')[]
}

export interface NumberJsonSchema extends BaseJsonSchema {
  type: 'number' | 'integer'
  multipleOf?: number
  minimum?: number
  exclusiveMinimum?: number
  maximum?: number
  exclusiveMaximum?: number
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
  minProperties?: number
  maxProperties?: number

  // StringMap
  patternProperties?: StringMap<JsonSchema>
  propertyNames?: JsonSchema

  /**
   * @example
   *
   * dependentRequired: {
   *   credit_card: ['billing_address']
   * }
   */
  dependentRequired?: StringMap<string[]>

  dependentSchemas?: StringMap<JsonSchema>

  dependencies?: StringMap<string[]>
}

export interface ArrayJsonSchema extends BaseJsonSchema {
  type: 'array'
  items: JsonSchema
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
}

export interface TupleJsonSchema extends BaseJsonSchema {
  type: 'array'
  items: JsonSchema[]
  minItems: number
  maxItems: number
}

export type JsonSchema =
  | BaseJsonSchema
  | RefJsonSchema
  | ConstJsonSchema
  | EnumJsonSchema
  | StringJsonSchema
  | NumberJsonSchema
  | BooleanJsonSchema
  | NullJsonSchema
  | ObjectJsonSchema
  | ArrayJsonSchema
  | TupleJsonSchema
