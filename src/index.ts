import { CommonTypeCfg } from './commonTypeCfg'
import { commonTypeGenerate, generateSchemasFromFilePaths } from './commonTypeGenerate'
import { FileWithContent, jsonSchemasToTS } from './jsonSchemaToTS'
import { tsFilesToJsonSchemas } from './tsToJsonSchema'

export type { CommonTypeCfg, FileWithContent }

export { commonTypeGenerate, tsFilesToJsonSchemas, generateSchemasFromFilePaths, jsonSchemasToTS }
