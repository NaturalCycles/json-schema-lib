#!/usr/bin/env node

import { _since } from '@naturalcycles/js-lib'
import { requireFileToExist } from '@naturalcycles/nodejs-lib'
import { boldWhite, dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import * as ts from 'typescript'
import { CommonTypeCfg } from '../commonTypeCfg'
import { commonTypeGenerate } from '../commonTypeGenerate'

runScript(async () => {
  const started = Date.now()
  const cwd = process.cwd()
  const cfgPath = `${cwd}/commonType.cfg.js`

  requireFileToExist(cfgPath)

  const cfg: CommonTypeCfg = require(`${cwd}/commonType.cfg`)

  console.log(boldWhite('common-type generate started'))
  console.log(dimGrey(`typescript ${ts.version}`))
  console.log(cfg)

  await commonTypeGenerate(cfg)

  console.log(boldWhite('common-type generate done') + dimGrey(' in ' + _since(started)))
})
