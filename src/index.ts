import { CommonTypeCfg } from './commonTypeCfg'
import { commonTypeGenerate, generateSchemasFromFilePaths } from './commonTypeGenerate'
import {
  ArrayJsonSchema,
  BaseJsonSchema,
  BooleanJsonSchema,
  ConstJsonSchema,
  EnumItem,
  EnumJsonSchema,
  JsonSchema,
  NullJsonSchema,
  NumberJsonSchema,
  ObjectJsonSchema,
  RefJsonSchema,
  StringJsonSchema,
  TupleJsonSchema,
} from './model'
import { tsFilesToJsonSchemas } from './tsToJsonSchema'

export type {
  CommonTypeCfg,
  JsonSchema,
  BaseJsonSchema,
  RefJsonSchema,
  ConstJsonSchema,
  EnumJsonSchema,
  StringJsonSchema,
  NumberJsonSchema,
  BooleanJsonSchema,
  NullJsonSchema,
  ObjectJsonSchema,
  ArrayJsonSchema,
  TupleJsonSchema,
  EnumItem,
}

export { commonTypeGenerate, tsFilesToJsonSchemas, generateSchemasFromFilePaths }
