export type CommonType = CommonObjectType | CommonTypeName | string

export type CommonTypeName =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'tuple'
  | 'StringMap'
  | 'enum'
  | 'null'

export type CommonValidationTypeName = 'integer' | 'id' | 'unixTimestamp' | 'isoDate'

export const PrimitiveTypes = new Set<CommonTypeName>([
  'string',
  'number',
  'boolean',
  'enum',
  'null',
])

export const KnownTypes = new Set<string>([
  'string',
  'number',
  'boolean',
  'array',
  'object',
  'enum',
  'null',
  'tuple',
  'StringMap',
])

export interface EnumItem<T extends string | number = string | number> {
  k: string
  v: T
}

/**
 * Field is a recursive definition.
 * Describes an Object with fields.
 * Can be a Root Type, or a field inside another Type.
 * Type is synonym to Object.
 */
export interface CommonObjectType {
  //
  // Main
  //
  /**
   * Name is optional for "anonymous types",
   * e.g. string[] will be Array of anonymous 'string' type
   */
  name?: string

  /**
   * 'string' would mean the name of the Custom Type (e.g another Interface)
   * Array means "Union type" (one of)
   */
  type: string | string[]

  /**
   * List of Types (interfaces) that this Type extends
   */
  extends?: string[]

  validationType?: CommonValidationTypeName | string

  //
  // Description / visualization
  //
  label?: string // `name` will be displayed if label is not defined
  descr?: string
  placeholder?: string

  //
  // Nullability
  //
  required?: boolean
  defaultValue?: any

  //
  // Structural
  //
  /**
   * Defined for `object` type.
   */
  properties?: CommonObjectType[]

  /**
   * Defined for `StringMap` type
   */
  stringMapOfType?: CommonType | CommonType[]

  /**
   * Set to true to allow additional (unvalidated) properties.
   *
   * @default false
   */
  additionalProperties?: boolean

  /**
   * Defined for `array` type.
   */
  arrayOfType?: CommonType | CommonType[]

  /**
   * Defined for `tuple` type
   */
  tupleTypes?: CommonType[]

  /**
   * Defined for `enum` type
   */
  enumItems?: EnumItem[]

  /**
   * For `string`, `number`, `boolean` literal types.
   * Becomes `const` in JSON schema
   */
  constValue?: string | number | boolean

  //
  // Validation
  //
  minLength?: number
  maxLength?: number
  regex?: string
  regexDescr?: string
}

// export const commonTypeSchema = objectSchema<CommonObjectType>({
//   name: stringSchema,
//   type: stringSchema,
//   label: stringSchema.optional(),
//   descr: stringSchema.optional(),
//   placeholder: stringSchema.optional(),
//   required: booleanSchema.optional(),
//   defaultValue: anySchema.optional(),
//   properties: arraySchema().optional(), // todo: self-reference it somehow
//   arrayOfType: stringSchema.optional(),
//   enumItems: arraySchema().optional(),
//   minLength: integerSchema.optional(),
//   maxLength: integerSchema.optional(),
//   regex: stringSchema.optional(),
//   regexDescr: stringSchema.optional(),
// }).options({stripUnknown: false})
