import { pMap, StringMap, _stringMapValues } from '@naturalcycles/js-lib'
import { AjvSchema } from '@naturalcycles/nodejs-lib'
import Ajv from 'ajv'
import * as fs from 'fs-extra'
import * as globby from 'globby'
import { CommonTypeCfg } from './commonTypeCfg'
import { resourcesDir } from './paths'
import { JsonSchema, tsFileToJsonSchemas } from './tsToJsonSchema'

const commonTypeCfgSchema = new AjvSchema<CommonTypeCfg>(
  fs.readJsonSync(`${resourcesDir}/CommonTypeCfg.schema.json`),
  { logErrors: true },
)

export async function commonTypeGenerate(cfg: CommonTypeCfg): Promise<void> {
  const log: (...args: any[]) => void = cfg.debug ? (...args) => console.log(...args) : () => {}

  // Validate cfg (dog-fooding)
  commonTypeCfgSchema.validate(cfg)

  const { paths, outputDir, includeSchemas, excludeSchemas } = cfg

  fs.ensureDirSync(outputDir)

  const files = globby.sync(paths)
  log(`${files.length} files`, files)

  if (!files.length) {
    return console.log('nothing to do, exiting')
  }

  const schemaMap: StringMap<JsonSchema> = {}
  let errors = 0

  files.forEach(filePath => {
    try {
      const fileString = fs.readFileSync(filePath, 'utf8')
      const schemas = tsFileToJsonSchemas(fileString, filePath)

      console.log(`${filePath}: ${schemas.length} schemas(s) generated`)
      schemas.forEach(s => {
        if (schemaMap[s.$id!]) {
          console.warn(
            `!!! ${s.$id} duplicated in ${filePath}, it will override previous schema with same $id`,
          )
        }
        schemaMap[s.$id!] = s
      })
    } catch (err) {
      errors++
      console.log(`${filePath} ts parse error:`, err)
    }
  })

  console.log(`${Object.keys(schemaMap).length} schema(s) generated, ${errors} errors`)

  // todo: process include/exclude types
  if (includeSchemas?.length) {
    const includeRegexes = includeSchemas.map(s => new RegExp(s))
    Object.keys(schemaMap).forEach(name => {
      if (!includeRegexes.some(reg => reg.test(name))) {
        delete schemaMap[name]
      }
    })
  }

  if (excludeSchemas?.length) {
    const excludeRegexes = excludeSchemas.map(s => new RegExp(s))
    Object.keys(schemaMap).forEach(name => {
      if (excludeRegexes.some(reg => reg.test(name))) {
        delete schemaMap[name]
      }
    })
  }

  const schemas = _stringMapValues(schemaMap)
  if (includeSchemas || excludeSchemas) {
    console.log(`${schemas.length} type(s) after inclusion/exclusion filters`)
  }

  if (!schemas.length) {
    return console.log(`no schemas to write, exiting`)
  }

  await pMap(schemas, async schema => {
    await fs.writeJson(`${outputDir}/${schema.$id}`, schema, { spaces: 2 })
  })

  console.log(`${schemas.length} json schema(s) saved`)

  // validate schemas with ajv

  const ajv = new Ajv({
    schemas,
  })
  schemas.forEach(schema => {
    log(`compiling ${schema.$id}`)
    try {
      ajv.compile(schema)
    } catch (err) {
      console.error(`ajv compile error on ${schema.$id}`, err)
    }
  })
}

// Used mostly for debugging
export function generateSchemasFromFilePaths(filePaths: string[]): JsonSchema[] {
  const schemas: JsonSchema[] = []

  filePaths.forEach(filePath => {
    const fileString = fs.readFileSync(filePath, 'utf8')
    schemas.push(...tsFileToJsonSchemas(fileString, filePath))
  })

  return schemas
}
