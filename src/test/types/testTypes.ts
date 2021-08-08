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

// `extends Array` should be ignored
export interface TestType extends Array<any> {
  s: string
  n: null
  s2: string | null
  p: (Person | null)[]
  // part?: Partial<Person>
  lhdays: [number, number][]
  lit?: 'some string'
  nlit?: 26
  litb?: true
  intersect?: Person & { id: string }
}

export interface TestPartialType {
  part?: Partial<Person>
  req?: Required<Person>
}

export interface TestRecordType {
  r?: Record<string, number>
  strMap: {
    req: number
    [k: string]: number
  }
}

// Should be excluded by test filters
export interface ShouldBeExcluded {
  e: string
}

// Should support types too
// eslint-disable-next-line unused-imports/no-unused-vars
export type AirtableId<T = any> = string

export class C {
  s!: string

  maybe?: string

  get a(): string {
    return this.s
  }
}
