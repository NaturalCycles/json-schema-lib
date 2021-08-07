## @naturalcycles/common-type

> Common Type interface and generator

[![npm](https://img.shields.io/npm/v/@naturalcycles/common-type/latest.svg)](https://www.npmjs.com/package/@naturalcycles/common-type)
[![min.gz size](https://badgen.net/bundlephobia/minzip/@naturalcycles/common-type)](https://bundlephobia.com/result?p=@naturalcycles/common-type)
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

## Develop

Typescript AST debugging: https://ts-ast-viewer.com/

## todo

- [x] parse multiple files, "cross-link" them
- [x] Link to schemas instead of inlining them (let ajv compile/combine them for us)

- [x] null type
- [x] union types support
- [x] nullable union types support
- [x] array of union types
- [x] tuple type
- [x] StringMap support
- [x] fix dataFlags bug
- [x] includeTypes/excludeTypes in cfg

Non-structural validation:

- [ ] unixTimestamp type
- [ ] isoDate type
- [ ] email type (regex)
- [ ] id type
- [ ] regex validation support

## Currently NOT supported

`Partial`, `Required`, `Omit`, `Pick`

Generic interfaces e.g:

```ts
interface MyType<T> {
  current: T
  future: T
}
```
