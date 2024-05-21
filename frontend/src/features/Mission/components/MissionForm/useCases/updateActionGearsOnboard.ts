import { MissionAction } from '@features/Mission/missionAction.types'
import { vesselApi } from '@features/Vessel/apis'
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
      vesselApi.endpoints.getRiskFactor.initiate(missionAction.internalReferenceNumber)
    )
    if (!riskFactor) {
      return []
    }

    const { gearOnboard } = riskFactor
    if (!gearOnboard?.length) {
      return []
    }

    const nextGears = gearOnboard
      .map(gear => {
        const gearByCode = gearsByCode[gear.gear]
        if (!gearByCode) {
          throw new FrontendError('`gearByCode` is undefined.')
        }

        return { ...gearByCode, declaredMesh: gear.mesh }
      })
      .map(gear => ({
        comments: undefined,
        controlledMesh: undefined,
        declaredMesh: gear.declaredMesh,
        gearCode: gear.code,
        gearName: gear.name,
        gearWasControlled: undefined,
        hasUncontrolledMesh: false
      }))

    setFieldValue('gearOnboard', nextGears)

    return nextGears
  }
