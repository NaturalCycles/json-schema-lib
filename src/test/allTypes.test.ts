import Ajv from 'ajv'
import * as globby from 'globby'
import { createJsonSchemas } from '../jsonSchemaGenerator'
import { testTypesDir } from '../paths'
import { tsParseFiles } from '../tsParser'

test('allTypes', () => {
  const files = globby.sync(testTypesDir)
  const types = tsParseFiles(files)
  expect(types).toMatchSnapshot()

  const schemas = createJsonSchemas(types)
  expect(schemas).toMatchSnapshot()

  // Ensure schemas don't throw ajv errors
  const ajv = new Ajv({ schemas })
  schemas.forEach(schema => ajv.compile(schema))
})
