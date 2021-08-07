export enum Consent {
  YES = 'YES',
  NO = 'NO',
}

export enum NumberEnum {
  YES = 1,
  NO = 2,
}

/**
 * Person type comment
 *
 * @additionalProperties
 */
export interface Person {
  name: string
  age?: number
}

export interface BaseAddress {
  address1: string
  address2?: string
  /**
   * asdf
   *
   * la la la
   *
   * @default asd
   *
   * @validationType unixTimestamp
   */
  ts?: number
  /**
   * @validationType integer
   */
  int?: number
  home?: boolean
  a1?: string[]
  a2?: string[][]
  o1?: {
    a: string
    b: number
  }
  p?: Person
  c?: Consent
  n?: NumberEnum
}

export interface SuperAddress extends BaseAddress, Person {
  address3: string
}

export interface Type2 {
  s?: string
}

export interface TestType {
  s: string
  n: null
  s2: string | null
  p: (Person | null)[]
  lhdays: [number, number][]
  lit?: 'some string'
  nlit?: 26
  litb?: true
  intersect?: Person & { id: string }
}

// Should be excluded by test filters
export interface ShouldBeExcluded {
  e: string
}

// Should support types too
// eslint-disable-next-line unused-imports/no-unused-vars
export type AirtableId<T = any> = string
