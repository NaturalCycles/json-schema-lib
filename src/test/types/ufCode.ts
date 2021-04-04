import { OvulationPrediction } from './uf'

export interface UFCode {
  checkLh?: boolean
  checkPreg?: boolean
  defMisc?: boolean
  defPreg?: boolean
  mens?: boolean

  /**
   * Confirmed ovulation (if in the past).
   * In the future - we don't use it:)
   */
  ovulation?: boolean

  /**
   * Frontend-only field to display "OvulationWindow'.
   */
  ovulationPrediction?: OvulationPrediction

  possMisc?: boolean
  possPreg?: boolean
}
