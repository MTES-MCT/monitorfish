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
  async (missionAction: MissionActionFormValues): Promise<MissionAction.SpeciesControl[]> => {
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
        rejectedWeight: undefined,
        speciesCode: specy.species,
        underSized: false,
        underSizedWeight: undefined
      }))

    const nextSpeciesOnboard = E_ISR_ENABLED
      ? mergeSpeciesOnboardWithPrefill(baseSpecies, prefillResult?.data ?? [])
      : baseSpecies

    setFieldValue('speciesOnboard', nextSpeciesOnboard)

    return nextSpeciesOnboard
  }

export function mergeSpeciesOnboardWithPrefill(
  riskFactorSpecies: MissionAction.SpeciesControl[],
  prefillData: Logbook.SpeciesControlPrefill[]
): MissionAction.SpeciesControl[] {
  const prefillBySpecies = new Map(prefillData.map(p => [p.speciesCode, p]))

  const merged = riskFactorSpecies.map(specy => {
    const prefill = prefillBySpecies.get(specy.speciesCode)
    if (!prefill) {
      return specy
    }

    return {
      ...specy,
      discardReason: prefill.discardReason ?? specy.discardReason,
      faoZones: prefill.faoZones ?? specy.faoZones,
      presentationCodes: prefill.presentationCodes ?? specy.presentationCodes,
      rejectedWeight: prefill.rejectedWeight ?? specy.rejectedWeight
    }
  })

  // Add species from prefill that are not in the risk factor list (DIS-only species)
  const riskFactorCodes = new Set(riskFactorSpecies.map(s => s.speciesCode))
  const disOnlySpecies = prefillData
    .filter(p => p.speciesCode && !riskFactorCodes.has(p.speciesCode))
    .map(p => ({
      controlledWeight: undefined,
      declaredWeight: undefined,
      discardReason: p.discardReason,
      faoZones: p.faoZones,
      nbFish: undefined,
      presentationCodes: p.presentationCodes,
      rejectedWeight: p.rejectedWeight,
      speciesCode: p.speciesCode as string,
      underSized: false,
      underSizedWeight: undefined
    }))

  return [...merged, ...disOnlySpecies]
}
