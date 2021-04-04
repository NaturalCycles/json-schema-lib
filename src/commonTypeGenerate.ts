import { pMap } from '@naturalcycles/js-lib'
import { AjvSchema } from '@naturalcycles/nodejs-lib'
import Ajv from 'ajv'
import * as fs from 'fs-extra'
import * as globby from 'globby'
import * as ts from 'typescript'
import { CommonTypeCfg } from './commonTypeCfg'
import { createJsonSchemas } from './jsonSchemaGenerator'
import { CommonObjectType } from './model'
import { resourcesDir } from './paths'
import { tsParseSourceFile } from './tsParser'

const commonTypeCfgSchema = new AjvSchema<CommonTypeCfg>(
  fs.readJsonSync(`${resourcesDir}/CommonTypeCfg.schema.json`),
  { logErrors: true },
)

export async function commonTypeGenerate(cfg: CommonTypeCfg): Promise<void> {
  const log: (...args: any[]) => void = cfg.debug ? (...args) => console.log(...args) : () => {}

  // Validate cfg (dog-fooding)
  commonTypeCfgSchema.validate(cfg)

  const { paths, outputDir, writeAST } = cfg

  fs.ensureDirSync(outputDir)

  const files = globby.sync(paths)
  log(`${files.length} files`, files)

  if (!files.length) {
    return console.log('nothing to do, exiting')
  }

  const types: CommonObjectType[] = []

  files.forEach(filePath => {
    try {
      const node = ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf8'),
        ts.ScriptTarget.Latest,
      )

      const newTypes = tsParseSourceFile(node)
      console.log(`${filePath}: ${newTypes.length} type(s) parsed`)
      types.push(...newTypes)
    } catch (err) {
      console.log(`${filePath} ts parse error:`)
      throw err
    }
  })

  console.log(`${types.length} type(s) parsed`)

  // todo: process include/exclude schemas

  if (!types.length) {
    return console.log(`no schemas to write, exiting`)
  }

  if (writeAST) {
    await pMap(types, async t => {
      await fs.writeJson(`${outputDir}/${t.name!}.ast.json`, t, { spaces: 2 })
    })
  }

  const schemas = createJsonSchemas(types)

  await pMap(schemas, async schema => {
    await fs.writeJson(`${outputDir}/${schema.$id}`, schema, { spaces: 2 })
  })

  console.log(`${schemas.length} json schemas created`)

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
