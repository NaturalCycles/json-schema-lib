/*

yarn tsn debugSchemaToTS

 */

import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import * as fs from 'fs-extra'
import * as globby from 'globby'
import { jsonSchemasToTS } from '../src/jsonSchemaToTS'
import { testDir, testSchemasDir } from '../src/paths'

const types2dir = `${testDir}/types2`

runScript(async () => {
  const schemas = globby.sync(`${testSchemasDir}`).map(f => fs.readJsonSync(f))
  // console.log(schemas)

  fs.ensureDirSync(types2dir)

  jsonSchemasToTS(schemas).forEach(([fileName, fileContent]) => {
    fs.writeFileSync(`${types2dir}/${fileName}`, fileContent)
  })
})
