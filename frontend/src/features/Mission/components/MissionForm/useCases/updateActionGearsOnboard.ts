import { GEAR_MARKING_NOT_APPLICABLE_CATEGORIES } from '@features/Mission/components/MissionForm/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { riskFactorApi } from '@features/RiskFactor/apis'
import { FrontendError } from '@libs/FrontendError'

import type { Gear } from '../../../../../domain/types/Gear'
import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainRootState } from '@store'
import type { AnyAction } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'

export const updateActionGearsOnboard =
  (
    dispatch: ThunkDispatch<MainRootState, undefined, AnyAction>,
    setFieldValue: (field: string, value: any) => void,
    gearsByCode: Record<string, Gear> | undefined
  ) =>
  async (missionAction: MissionActionFormValues): Promise<MissionAction.GearControl[]> => {
    if (!gearsByCode || !missionAction.internalReferenceNumber) {
      return []
    }

    const { data: riskFactor } = await dispatch(
      riskFactorApi.endpoints.getRiskFactor.initiate(missionAction.internalReferenceNumber)
    )
    if (!riskFactor) {
      return []
    }

    const { gearOnboard } = riskFactor
    if (!gearOnboard?.length) {
      return []
    }

    const nextGears = gearOnboard
      .filter(gear => !!gear.gear)
      .map(gear => {
        const gearByCode = gearsByCode[gear.gear as string]
        if (!gearByCode) {
          throw new FrontendError('`gearByCode` is undefined.')
        }

        return { ...gearByCode, declaredMesh: gear.mesh }
      })
      .map(gear => ({
        averageWireThickness: undefined,
        comments: undefined,
        controlledMesh: undefined,
        declaredMesh: gear.declaredMesh,
        gearCode: gear.code,
        gearMarkingIsCompliant: GEAR_MARKING_NOT_APPLICABLE_CATEGORIES.includes(gear.category)
          ? MissionAction.ControlCheck.NOT_APPLICABLE
          : undefined,
        gearName: gear.name,
        gearWasControlled: undefined,
        hasUncontrolledMesh: false,
        wireType: undefined
      }))

    setFieldValue('gearOnboard', nextGears)

    return nextGears
  }
