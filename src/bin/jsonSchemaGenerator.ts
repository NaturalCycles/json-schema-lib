#!/usr/bin/env node

import { _since } from '@naturalcycles/js-lib'
import { requireFileToExist } from '@naturalcycles/nodejs-lib'
import { boldWhite, dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import * as ts from 'typescript'
import { jsonSchemaGenerate } from '../jsonSchemaGenerate'
import { JsonSchemaGeneratorCfg } from '../jsonSchemaGeneratorCfg'

runScript(() => {
  const started = Date.now()
  const cwd = process.cwd()
  const cfgPath = `${cwd}/jsonSchemaGenerator.cfg.js`

  requireFileToExist(cfgPath)

  const cfg: JsonSchemaGeneratorCfg = require(`${cwd}/jsonSchemaGenerator.cfg`)

  console.log(boldWhite('jsonSchemaGenerator started'))
  console.log(dimGrey(`typescript ${ts.version}`))
  console.log(cfg)

  jsonSchemaGenerate(cfg)

  console.log(boldWhite('jsonSchemaGenerator done') + dimGrey(' in ' + _since(started)))
})
