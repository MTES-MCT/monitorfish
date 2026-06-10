import { logbookApi } from '@features/Logbook/api'
import { getSummedSpeciesOnBoard } from '@features/Logbook/utils'
import { E_ISR_ENABLED } from '@features/Mission/components/MissionForm/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { riskFactorApi } from '@features/RiskFactor/apis'

import type { Logbook } from '@features/Logbook/Logbook.types'
import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { RiskFactor } from '@features/RiskFactor/types'

export const updateActionSpeciesOnboard =
  (dispatch, setFieldValue: (field: string, value: any) => void) =>
  async (missionAction: MissionActionFormValues): Promise<MissionAction.SpeciesOnboardControl[]> => {
    if (!missionAction.internalReferenceNumber) {
      return []
    }

    const cfr = missionAction.internalReferenceNumber

    const [{ data: riskFactor }, prefillResult] = await Promise.all([
      dispatch(riskFactorApi.endpoints.getRiskFactor.initiate(cfr)),
      E_ISR_ENABLED ? dispatch(logbookApi.endpoints.getSpeciesControlPrefill.initiate(cfr)) : Promise.resolve(undefined)
    ])

    if (!riskFactor) {
      return []
    }

    const { speciesOnboard } = riskFactor as RiskFactor
    if (!speciesOnboard?.length) {
      return []
    }

    const summedSpeciesOnboard = getSummedSpeciesOnBoard(speciesOnboard)
    const baseSpecies = summedSpeciesOnboard
      .filter(specy => !!specy.weight)
      .sort((a, b) => (b.weight as number) - (a.weight as number))
      .map(specy => ({
        controlledWeight: undefined,
        declaredWeight: specy.weight,
        nbFish: undefined,
        speciesCode: specy.species,
        underSized: false,
        underSizedWeight: undefined
      }))

    const { discardedSpecies, nextSpeciesOnboard } = E_ISR_ENABLED
      ? mergeSpeciesOnboardWithPrefill(baseSpecies, prefillResult?.data ?? [])
      : { discardedSpecies: [], nextSpeciesOnboard: baseSpecies }

    setFieldValue('speciesOnboard', nextSpeciesOnboard)
    setFieldValue('discardedSpecies', discardedSpecies)

    return nextSpeciesOnboard
  }

/**
 * Splits the logbook prefill into:
 * - `nextSpeciesOnboard`: the risk factor catches enriched with FAR metadata (faoZones, presentationCodes).
 * - `discardedSpecies`: one entry per logbook discard (DIS/DIM), kept separate from the catches.
 */
export function mergeSpeciesOnboardWithPrefill(
  riskFactorSpecies: MissionAction.SpeciesOnboardControl[],
  prefillData: Logbook.SpeciesControlPrefill[]
): {
  discardedSpecies: MissionAction.DiscardedSpeciesControl[]
  nextSpeciesOnboard: MissionAction.SpeciesOnboardControl[]
} {
  // Catch prefill entries (no discardReason) carry the FAR metadata to merge into the risk factor catches.
  const catchPrefillBySpecies = new Map(prefillData.filter(p => !p.discardReason).map(p => [p.speciesCode, p]))

  const nextSpeciesOnboard = riskFactorSpecies.map(specy => {
    const prefill = catchPrefillBySpecies.get(specy.speciesCode)
    if (!prefill) {
      return specy
    }

    return {
      ...specy,
      faoZones: prefill.faoZones ?? specy.faoZones,
      presentationCodes: prefill.presentationCodes ?? specy.presentationCodes
    }
  })

  // Discard prefill entries (with a discardReason) become standalone discard entries.
  const discardedSpecies = prefillData
    .filter(p => !!p.discardReason)
    .map(p => ({
      discardReason: p.discardReason,
      faoZones: p.faoZones,
      rejectedWeight: p.rejectedWeight,
      speciesCode: p.speciesCode
    }))

  return { discardedSpecies, nextSpeciesOnboard }
}
