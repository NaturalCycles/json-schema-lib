import { generateJsonSchemaFromData } from './generateJsonSchemaFromData'
import { generateSchemasFromFilePaths, jsonSchemaGenerate } from './jsonSchemaGenerate'
import { JsonSchemaGeneratorCfg } from './jsonSchemaGeneratorCfg'
import { FileWithContent, jsonSchemasToTS } from './jsonSchemaToTS'
import { tsFilesToJsonSchemas } from './tsToJsonSchema'

export type { JsonSchemaGeneratorCfg, FileWithContent }

export {
  jsonSchemaGenerate,
  tsFilesToJsonSchemas,
  generateSchemasFromFilePaths,
  jsonSchemasToTS,
  generateJsonSchemaFromData,
}
