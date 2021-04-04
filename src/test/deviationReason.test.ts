import { AjvSchema } from '@naturalcycles/nodejs-lib'
import { createJsonSchemas } from '../jsonSchemaGenerator'
import { testTypesDir } from '../paths'
import { tsParseFile } from '../tsParser'
import { DeviationReason } from './types/deviationReason'

test('deviationReason', () => {
  const types = tsParseFile(`${testTypesDir}/deviationReason.ts`)
  expect(types[0]).toMatchInlineSnapshot(`
Object {
  "enumItems": Array [
    Object {
      "k": "OTHER",
      "v": -1,
    },
    Object {
      "k": "ALGO",
      "v": 1,
    },
    Object {
      "k": "SLEEP",
      "v": 2,
    },
    Object {
      "k": "ALCOHOL",
      "v": 3,
    },
    Object {
      "k": "SICK",
      "v": 4,
    },
  ],
  "name": "DeviationReason",
  "type": "enum",
}
`)

  const schemas = createJsonSchemas(types)
  expect(schemas[0]).toMatchInlineSnapshot(`
Object {
  "$id": "DeviationReason.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "enum": Array [
    -1,
    1,
    2,
    3,
    4,
  ],
}
`)

  const ajvSchema = new AjvSchema<DeviationReason>(schemas[0])
  ajvSchema.validate(DeviationReason.SLEEP)
  expect(ajvSchema.isValid(-2)).toBe(false)
  expect(ajvSchema.isValid('-1' as any)).toBe(false)
  expect(ajvSchema.isValid(null as any)).toBe(false)
  expect(ajvSchema.isValid(undefined as any)).toBe(false)
})
