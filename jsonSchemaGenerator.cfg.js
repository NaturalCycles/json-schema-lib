const cfg = {
  paths: ['src/test/types/*.ts', 'src/jsonSchemaGeneratorCfg.ts'],
  outputDir: 'src/test/schemas',
  // paths: ['src/test/model/*.ts'],
  // outputDir: 'src/test/model/schemas',
  // includeSchemas: [],
  excludeSchemas: ['Excluded'],
  debug: true,
}

module.exports = cfg
