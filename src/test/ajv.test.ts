import { AjvSchema } from '@naturalcycles/nodejs-lib'
import * as fs from 'fs-extra'
import { testSchemasDir } from '../paths'
import { BaseAddress, TestType, Type2 } from './types/testTypes'

const type2Schema = fs.readJsonSync(`${testSchemasDir}/Type2.schema.json`)
const testTypeSchema = fs.readJsonSync(`${testSchemasDir}/TestType.schema.json`)
const baseAddressSchema = fs.readJsonSync(`${testSchemasDir}/BaseAddress.schema.json`)
const personSchema = fs.readJsonSync(`${testSchemasDir}/Person.schema.json`)
const consentSchema = fs.readJsonSync(`${testSchemasDir}/Consent.schema.json`)
const numberEnumSchema = fs.readJsonSync(`${testSchemasDir}/NumberEnum.schema.json`)

test('type2 schema', () => {
  const schema = new AjvSchema(type2Schema)

  const v1: Type2 = {
    s: 'sdf',
  }

  schema.validate(v1)

  schema.validate({})

  // schema.validate({extra: 1})
  expect(() => schema.validate({ s: 1, s2: 's' })).toThrowErrorMatchingInlineSnapshot(
    `"Type2/s must be string"`,
  )
})

test('baseAddress', () => {
  const schema = new AjvSchema<BaseAddress>(baseAddressSchema, {
    schemas: [personSchema, consentSchema, numberEnumSchema],
  })

  const a1 = {
    address1: 'sdf',
    p: {
      name: 'hey',
      a: 'a',
    },
  } as any

  schema.validate(a1)
  console.log(a1)
})

test('testType', () => {
  const schema = new AjvSchema<TestType>(testTypeSchema, {
    schemas: [personSchema],
  })

  schema.validate({
    s: 's',
    n: null,
    s2: null,
    p: [
      null,
      null,
      {
        name: 'n',
      },
    ],
    lhdays: [
      [1, 1],
      [1, 2],
    ],
  } as any)
})
