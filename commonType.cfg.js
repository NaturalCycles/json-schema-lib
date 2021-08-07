const cfg = {
  paths: ['src/test/types/*.ts', 'src/commonTypeCfg.ts'],
  outputDir: 'src/test/schemas',
  // includeTypes: [],
  excludeTypes: ['Excluded'],
  writeAST: true,
  debug: true,
}

module.exports = cfg
