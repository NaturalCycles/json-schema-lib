## @naturalcycles/json-schema-lib

> JSON schema to/from TypeScript parser/generator

[![npm](https://img.shields.io/npm/v/@naturalcycles/json-schema-lib/latest.svg)](https://www.npmjs.com/package/@naturalcycles/json-schema-lib)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Allows to generate [JSON Schema](https://json-schema.org/) from a set of Typescript files with
Interfaces (also Types and Enums).

Also, to generate Typescript files from JSON schemas (reverse).

Status: experimental! Everything is subject to change!

# Example

Install `json-schema-lib` as your devDependency:

    yarn add -D @naturacycles/json-schema-lib

Define a `jsonSchemaGenerator.cfg.js` in the root of you project:

```js
module.exports = {
  paths: ['src/types/*.ts'],
  outputDir: 'resources/schemas',
}
```

Config says to scan all `*.ts` files in `src/types`, parse them, generate JSON schemas, write them
into `resources/schemas` folder.

## Similar projects

- https://github.com/YousefED/typescript-json-schema
- https://github.com/vega/ts-json-schema-generator

## Develop

Typescript AST debugging: https://ts-ast-viewer.com/

## Supported

- Schemas from:
  - Interfaces
  - Types
  - Enums
  - Classes
- `string`, `number`, `boolean`
- Literal types, e.g `someString`, 15, `true`
- `null` type
- `object`, `array`
- `tuple`
- `enum` (`string` and `number` values)
- optional/required properties
- Union types (`|`), Intersections (`&`), `extends`
- jsdoc `@validationType` (e.g. `integer`)
- Type references, e.g. `p: Person` (where `Person` is defined elsewhere, can be in another file)
- Parsing a list of files (not necessary for all types to be in 1 file)
- `Partial`, `Required`
- `Record<A, B>`
- Indexed properties (`{ [name: string]: string }`)
- `StringMap` (aka Dictionary)
- jsdoc tags:
  - `validationType` to override `type`, e.g. `@validationType integer`
  - General: `deprecated`, `readOnly`, `writeOnly`, `default`
  - String: `pattern`, `format`, `minLength`, `maxLength`
  - Number: `multipleOf`, `minimum`, `exclusiveMinimum`, `maximum`, `exclusiveMaximum`
  - Object: `additionalProperties`, `minProperties`, `maxProperties`
  - Array: `minItems`, `maxItems`, `uniqueItems`
  - Schema composition: `if`, `then`, `else`, `dependencies`, `dependentRequired`,
    `dependentSchemas`

## Currently NOT supported

- `Omit`, `Pick`
- Generic interfaces, e.g. `interface MyType<T> { current: T, future: T }`
- `typeof`
- `keyof`
- Conditional types

## generateJsonSchemaFromData

This function is able to generate a JsonSchema given an array of data samples (objects).
