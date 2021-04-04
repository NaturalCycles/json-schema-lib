import { DataFlag } from './dataFlag'
import { DeviationReason } from './deviationReason'
import {
  CervicalMucusConsistency,
  DataQuantity,
  HadSex,
  Libido,
  Mens,
  SexType,
  TestResult,
} from './uf'

export interface DailyEntryBM {
  date: string
  updated?: number
  temperatureUpdatedTimestamp?: number
  temperatureMeasuredTimestamp?: number
  deviationReason?: DeviationReason
  skipped?: boolean
  temperature?: number
  lhTest?: TestResult
  pregTest?: TestResult
  mens?: Mens
  sex?: HadSex
  notes?: string
  source?: string
  dataFlags: DataFlag[]
  mensQuantity?: DataQuantity
  cervicalMucusConsistency?: CervicalMucusConsistency
  cervicalMucusQuantity?: DataQuantity
  sexType?: SexType
  libido?: Libido
  covidTest?: TestResult
}
