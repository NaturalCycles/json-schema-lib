const cfg = {
  paths: ['src/test/types/*.ts', 'src/commonTypeCfg.ts'],
  outputDir: 'src/test/schemas',
  // paths: ['src/test/model/*.ts'],
  // outputDir: 'src/test/model/schemas',
  // includeSchemas: [],
  excludeSchemas: ['Excluded'],
  writeAST: true,
  debug: true,
}

module.exports = cfg
