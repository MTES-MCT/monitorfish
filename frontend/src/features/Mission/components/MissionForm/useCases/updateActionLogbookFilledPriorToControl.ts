import { logbookApi } from '@features/Logbook/api'
import { E_ISR_ENABLED } from '@features/Mission/components/MissionForm/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { vesselApi } from '@features/Vessel/vesselApi'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export const updateActionLogbookFilledPriorToControl =
  (dispatch, setFieldValue: (field: string, value: any) => void) => async (missionAction: MissionActionFormValues) => {
    if (!missionAction.internalReferenceNumber || !E_ISR_ENABLED) {
      return
    }

    const cfr = missionAction.internalReferenceNumber

    const [vesselResult, { data: hasFilledLogbookForCurrentTrip }] = await Promise.all([
      missionAction.vesselId && missionAction.vesselId !== UNKNOWN_VESSEL.vesselId
        ? dispatch(vesselApi.endpoints.getVessel.initiate(missionAction.vesselId))
        : Promise.resolve(undefined),
      dispatch(logbookApi.endpoints.getHasFilledLogbookForCurrentTrip.initiate(cfr))
    ])

    const vessel = vesselResult?.data
    const isVesselUnder10m = !!vessel?.length && vessel.length <= 10
    if (isVesselUnder10m) {
      setFieldValue('logbookFilledPriorToControl', MissionAction.ControlCheck.NOT_APPLICABLE)

      return
    }

    setFieldValue(
      'logbookFilledPriorToControl',
      hasFilledLogbookForCurrentTrip ? MissionAction.ControlCheck.YES : MissionAction.ControlCheck.NO
    )
  }
