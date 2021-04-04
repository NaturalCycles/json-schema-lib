import { StringMap } from '@naturalcycles/js-lib'
import { DailyEntryBM } from './dailyEntry'
import { DataFlag } from './dataFlag'
import { UFCode } from './ufCode'

export enum UFColor {
  RED = 1,
  YELLOW = 2,
  GREEN = 3,
}

export enum Goal {
  PREVENT = 'PREVENT',
  PLAN = 'PLAN',
  PREGNANT = 'PREGNANT',
}

export interface BaseColorCode {
  date: string
  color: UFColor
  redscale?: number
  code: UFCode
  cd: number
  nCycle: number
  goal: Goal

  lhStatus?: LHStatus
  ovulationStatus?: OvulationStatus
  pregnancyTestStatus?: PregnancyTestStatus
}

export interface UFColorCode extends BaseColorCode {
  cycleStartDate: string
}

export interface UFPredictionColorCode extends BaseColorCode {
  dataFlags?: DataFlag[]
  mensQuantity?: DataQuantity
}

export enum OvulationPrediction {
  OVULATION = 'OVULATION',
  WINDOW1 = 'WINDOW1',
  WINDOW2 = 'WINDOW2',
}

export enum LHStatus {
  LH_PREDICTION = 1,
  LH_NEG_PRE_OVU_CONFIRMED = 2,
  LH_POS_PRE_OVU_CONFIRMED = 3,
  LH_NEG_OVU_DAY = 4,
  LH_POS_OVU_CONFIRMED = 5,
  LH_POS_OVU_NOT_CONFIRMED = 6,
}

export enum OvulationStatus {
  OVU_CONFIRMED = 1,
  OVU_NOT_CONFIRMED = 2,
  OVU_WAITING = 3,
  OVU_PREDICTION = 4,
  OVU_DAY = 5,
  ANOVULATORY = 6,
}

export enum PregnancyTestStatus {
  PREG_PREDICTION = 1,
  PREG_NEGATIVE = 2,
  PREG_POSITIVE = 3,
}

export enum TestResult {
  YES = 1,
  NO = 2,
}

export enum Mens {
  MENSTRUATION = 1,
  SPOTTING = 2,
}

export enum HadSex {
  YES = 1,
  YES_PROTECTED = 2,
  NO = 3,
}

export enum DataQuantity {
  NONE = 1,
  LIGHT = 2,
  MEDIUM = 3,
  HEAVY = 4,
}

export enum SexType {
  CONDOM = 1,
  WITHDRAWAL = 2,
  NO_WITHDRAWAL = 3,
  OTHER = 4,
}

export enum CervicalMucusConsistency {
  STICKY = 1,
  CREAMY = 2,
  EGGWHITE = 3,
  WATERY = 4,
}

export enum Libido {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export enum CurrentPhaseId {
  PERIOD = 1,
  FOLLICULAR = 2,
  OVULATION = 3,
  OVULATION_WAITING = 4,
  LUTEAL = 5,
}

export interface CycleSummary {
  startDate: string
  endDate: string
  nCycle: number
  cycleLength: number
  mensLength: number
  ovulationCD?: number // undefined when ovulation is not detected
  ovulationDate?: string // undefined when ovulation is not detected
  spottingDays?: number
  lhTestPositive?: number
  lhTestNegative?: number
  unprotectedSex?: number
  pregnancyEndDate?: string
}

export interface CurrentPhase {
  id: CurrentPhaseId
  trackersGeneric?: boolean
  dataFlags: DataFlag[]
  libido?: Libido
  // other DailyEntry properties can be added here, e.g cervicalMucus
}

export interface UserFertilityStats {
  lowTempMean?: number
  lowTempRMS?: number

  highTempMean?: number
  highTempRMS?: number

  pregTempMean?: number
  pregTempRMS?: number
}

export interface UserFertility extends UserFertilityStats {
  v: number
  algoVersion?: string

  /**
   * Can be undefined in older versions of UserFertilityCache!
   */
  fahrenheit?: boolean

  startDate: string
  todayDate: string
  lastDate: string
  conceptionDate?: string
  dueDate?: string
  minPossiblePregnancyEndedDate?: string

  greenDays: number
  redDays: number
  yellowDays: number

  dataActivity: number

  noOCycles: boolean[]

  cycleLengths: (number | null)[]
  ovulationDays: (number | null)[]
  predOvulationDays: (number | null)[]
  ovulationWindowMin: (number | null)[]
  ovulationWindowMax: (number | null)[]
  mensLengths: (number | null)[]

  cycleSummaries?: (CycleSummary | null)[]

  currentPhase?: CurrentPhase

  lhdays: [number, number][]

  clave: number
  claveRMS: number
  greenbfO: number
  lpave: number
  lpaveRMS: number
  mdays: number
  mdaysRMS?: number
  ncycles: number
  oave: number
  oaveRMS: number
  pregnantNow: boolean

  entryMap: StringMap<DailyEntryBM>
  colorMap: StringMap<UFColorCode>
  predictionMap: StringMap<UFPredictionColorCode>
}
