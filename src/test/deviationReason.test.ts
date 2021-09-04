import { JsonSchema } from '@naturalcycles/js-lib'
import { AjvSchema } from '@naturalcycles/nodejs-lib'
import { generateSchemasFromFilePaths } from '../commonTypeGenerate'
import { testTypesDir } from '../paths'
import { DeviationReason } from './types/deviationReason'

test('deviationReason', () => {
  const schemas = generateSchemasFromFilePaths([`${testTypesDir}/deviationReason.ts`])
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

  const ajvSchema = AjvSchema.create(schemas[0] as JsonSchema<DeviationReason>)
  ajvSchema.validate(DeviationReason.SLEEP)
  expect(ajvSchema.isValid(-2)).toBe(false)
  expect(ajvSchema.isValid('-1' as any)).toBe(false)
  expect(ajvSchema.isValid(null as any)).toBe(false)
  expect(ajvSchema.isValid(undefined as any)).toBe(false)
})
