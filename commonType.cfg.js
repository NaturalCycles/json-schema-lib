const cfg = {
  paths: ['src/test/types/*.ts', 'src/commonTypeCfg.ts'],
  // paths: ['src/test/model/*.ts'],
  // outputDir: 'src/test/model/schemas',
  outputDir: 'src/test/schemas',
  // includeSchemas: [],
  excludeSchemas: ['Excluded'],
  writeAST: true,
  debug: true,
}

module.exports = cfg
