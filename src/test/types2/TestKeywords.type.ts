//
// Auto-generated by @naturalcycles/json-schema-lib, do not edit manually
//

export interface TestKeywords {
  /**
   * @default Abc
   * @pattern A[a-z]{1,4}
   * @minLength 1
   * @maxLength 5
   */
  s?: string
  /**
   * @minimum 6
   * @maximum 8
   * @multipleOf 2
   * @validationType integer
   */
  n?: number
  dateMap?: {
    [k: string]: string
  }
  /**
   * @minItems 1
   * @maxItems 3
   * @uniqueItems
   */
  a?: number[]
  /**
   * @format email
   * @trim
   * @toLowerCase
   */
  email?: string
}
