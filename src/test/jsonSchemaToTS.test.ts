import { JsonSchema, JsonSchemaConst, JsonSchemaEnum } from '@naturalcycles/js-lib'
import { rootJsonSchemaToTS } from '../jsonSchemaToTS'

const literalStrSchema: JsonSchemaConst = {
  $id: 'Item.schema.json',
  const: 'abc',
}

// const literalNumSchema: JsonSchemaConst = {
//   $id: 'Item.schema.json',
//   const: 26,
// }

const numberEnumSchema: JsonSchemaEnum = {
  $id: 'DataFlag.schema.json',
  enum: [1, 2, 3],
}

const stringEnumSchema: JsonSchemaEnum = {
  $id: 'DataFlag.schema.json',
  enum: ['TIRED', 'BORED', 'STRESSED'],
}

const addressSchema: JsonSchema<any> = {
  $id: 'Address.schema.json',
  type: 'object',
  properties: {
    name: { type: 'string' },
    address1: { type: 'string' },
    address2: { type: 'string' },
    even: { type: 'boolean' },
    int: { type: 'integer' },
    constNum: { const: 26 },
    constStr: { const: 'abc' },
    constBool: { const: true },
    nullProp: { type: 'null' },
    strArray: { type: 'array', items: { type: 'string' } },
    numArray: { type: 'array', items: { type: 'number' } },
    tuple1: {
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
      minItems: 2,
      maxItems: 2,
    },
    person: { $ref: 'Person' },
    nestedObj: {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: { type: 'string' },
          },
        },
      },
    },
    union1: {
      oneOf: [{ type: 'string' }, { type: 'number' }],
    },
    union2: {
      oneOf: [
        { type: 'string' },
        { $ref: 'Person' },
        { type: 'object', properties: { a: { type: 'string' } } },
      ],
    },
    intersection1: {
      allOf: [
        {
          type: 'object',
          properties: {
            a: { type: 'string' },
          },
        },
        {
          type: 'object',
          properties: {
            n: { type: 'number' },
          },
        },
      ],
    },
    indexed: {
      type: 'object',
      properties: {
        a: { type: 'string' },
      },
      patternProperties: {
        '.*': { type: 'string' },
      },
    },
  },
  required: ['name', 'address1'],
}

test('literalStrSchema', () => {
  expect(rootJsonSchemaToTS(literalStrSchema)).toMatchSnapshot()
})

test('numberEnumSchema', () => {
  expect(rootJsonSchemaToTS(numberEnumSchema)).toMatchSnapshot()
})

test('stringEnumSchema', () => {
  expect(rootJsonSchemaToTS(stringEnumSchema)).toMatchSnapshot()
})

test('addressSchema', () => {
  const s = rootJsonSchemaToTS(addressSchema)
  // console.log(s[1])
  expect(s).toMatchSnapshot()
})
