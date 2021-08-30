/*

yarn tsn debug

 */

import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import Ajv from 'ajv'
import * as fs from 'fs-extra'
import { generateSchemasFromFilePaths } from '../src/commonTypeGenerate'
import { testDir, tmpDir } from '../src/paths'

runScript(async () => {
  // const types = tsParseFile(`${testDir}/model/dailyEntry.shared.model.ts`)
  // const types = tsParseFile(`${testDir}/types/testTypes.ts`)
  // const type = types.find(t => t.name === 'TestType')
  // // console.log(type)
  //
  // const schemas = createJsonSchemas(types)
  // console.log(schemas.find(s => s.$id!.includes('TestType')))

  // await commonTypeGenerate({
  //   paths: ['src/test/types/testTypes.ts'],
  //   outputDir: testSchemasDir,
  //   includeTypes: ['Airtable'],
  // })

  const fileName = `${testDir}/types/testTypes.ts`
  const schemas = generateSchemasFromFilePaths([fileName])
  // console.log(schemas)

  fs.ensureDirSync(`${tmpDir}/schemas`)

  schemas.forEach(s => {
    fs.writeJsonSync(`${tmpDir}/schemas/${s.$id}`, s, { spaces: 2 })
  })

  const ajv = new Ajv({
    schemas,
  })
  schemas.forEach(s => {
    try {
      ajv.compile(s)
    } catch (err) {
      console.log(`avj compile error at ${s.$id}`)
      console.error(err)
    }
  })
})
