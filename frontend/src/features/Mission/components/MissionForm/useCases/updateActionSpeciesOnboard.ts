import { getSummedSpeciesOnBoard } from '@features/Logbook/utils'
import { MissionAction } from '@features/Mission/missionAction.types'
import { riskFactorApi } from '@features/RiskFactor/apis'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { RiskFactor } from '@features/RiskFactor/types'

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
      .sort((a, b) => b.weight - a.weight)
      .map(specy => ({
        controlledWeight: undefined,
        declaredWeight: specy.weight,
        nbFish: undefined,
        speciesCode: specy.species,
        underSized: false
      }))

    setFieldValue('speciesOnboard', nextSpeciesOnboard)

    return nextSpeciesOnboard
  }
