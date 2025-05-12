import { getSummedSpeciesOnBoard } from '@features/Logbook/utils'
import { MissionAction } from '@features/Mission/missionAction.types'
import { riskFactorApi } from '@features/RiskFactor/apis'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { RiskFactor } from '@features/RiskFactor/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export const updateActionSpeciesOnboard =
  (dispatch, setFieldValue: (field: string, value: any) => void) =>
  async (missionAction: MissionActionFormValues): Promise<MissionAction.SpeciesControl[]> => {
    if (!missionAction.internalReferenceNumber) {
      return []
    }

    const { data: riskFactor } = await dispatch(
      riskFactorApi.endpoints.getRiskFactor.initiate(missionAction.internalReferenceNumber)
    )
    if (!riskFactor) {
      return []
    }

    const { speciesOnboard } = riskFactor as RiskFactor
    if (!speciesOnboard?.length) {
      return []
    }

    const summedSpeciesOnboard = getSummedSpeciesOnBoard(speciesOnboard)
    const nextSpeciesOnboard = summedSpeciesOnboard
      .filter((specy: Vessel.DeclaredLogbookSpecies) => !!specy.weight)
      .sort((a, b) => (b.weight as number) - (a.weight as number))
      .map((specy: Vessel.DeclaredLogbookSpecies) => ({
        controlledWeight: undefined,
        declaredWeight: specy.weight,
        nbFish: undefined,
        speciesCode: specy.species,
        speciesName: specy.speciesName,
        underSized: false
      }))

    setFieldValue('speciesOnboard', nextSpeciesOnboard)

    return nextSpeciesOnboard
  }
