import Ajv from 'ajv'
import * as globby from 'globby'
import { generateSchemasFromFilePaths } from '../commonTypeGenerate'
import { testTypesDir } from '../paths'

test('allTypes', () => {
  const files = globby.sync(testTypesDir)
  const schemas = generateSchemasFromFilePaths(files).filter(s => !s.$id!.includes('Excluded'))
  expect(schemas).toMatchSnapshot()

  // Ensure schemas don't throw ajv errors
  const ajv = new Ajv({ schemas })
  schemas.forEach(schema => ajv.compile(schema))
})
