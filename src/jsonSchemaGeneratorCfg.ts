export interface JsonSchemaGeneratorCfg {
  /**
   * Array of paths to scan interfaces in.
   * Globs are allowed (using `globby` package).
   *
   * By default, all found exported Interfaces and Enums will be used.
   * Specify includeList/excludeList to limit this.
   */
  paths: string[]

  /**
   * Dir to write json schemas to.
   * Will be auto-created if doesn't exist.
   * All schemas will be placed flat in this one dir (no sub-dirs will be created).
   */
  outputDir: string

  includeSchemas?: string[]

  excludeSchemas?: string[]

  /**
   * Set to true to enable debug logging.
   *
   * @default false
   */
  debug?: boolean
}
