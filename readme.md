## @naturalcycles/common-type

> Common Type interface and generator

[![npm](https://img.shields.io/npm/v/@naturalcycles/common-type/latest.svg)](https://www.npmjs.com/package/@naturalcycles/common-type)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Allows to generate "Common Type" and [JSON Schema](https://json-schema.org/) from a set of
Typescript files with Interfaces (also Types and Enums).

Status: experimental! Everything is subject to change!

# Example

Install `common-type` as your devDependency:

    yarn add -D @naturacycles/common-type

Define a `commonType.cfg.js` in the root of you project:

```js
module.exports = {
  paths: ['src/types/*.ts'],
  outputDir: 'src/schemas',
}
```

Config says to scan all `*.ts` files in `src/types`, parse them, generate JSON schemas, write them
into `src/schemas` folder.

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
- `StringMap` (aka Dictionary)
- jsdoc `@validationType` (e.g. `integer`)
- Type references, e.g. `p: Person` (where `Person` is defined elsewhere, can be in another file)
- Parsing a list of files (not necessary for all types to be in 1 file)

## todo

Non-structural validation:

- [ ] unixTimestamp type
- [ ] isoDate type
- [ ] email type (regex)
- [ ] id type
- [ ] regex validation support

## Currently NOT supported

- `Partial`, `Required`
- `Omit`, `Pick`

Generic interfaces e.g:

```ts
interface MyType<T> {
  current: T
  future: T
}
```

- `Record<A, B>`
- Indexed properties (`{ [name: string]: string }`)
- `typeof`
- `keyof`
- conditional types
