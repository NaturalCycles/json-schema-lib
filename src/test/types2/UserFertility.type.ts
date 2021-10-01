//
// Auto-generated by @naturalcycles/json-schema-lib, do not edit manually
//

import {
  CurrentPhase,
  CycleSummary,
  DailyEntryBM,
  UFColorCode,
  UFPredictionColorCode,
  UserFertilityStats,
} from '.'

export type UserFertility = {
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
  entryMap: {
    [k: string]: DailyEntryBM
  }
  colorMap: {
    [k: string]: UFColorCode
  }
  predictionMap: {
    [k: string]: UFPredictionColorCode
  }
} & UserFertilityStats