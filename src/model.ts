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
