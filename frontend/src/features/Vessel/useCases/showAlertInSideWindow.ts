import { focusOnAlert } from '@features/Alert/components/SideWindowAlerts/slice'
import { SideWindowMenuKey } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'

import type { Vessel } from '../Vessel.types'
import type { MainAppThunk } from '@store'

export const showAlertInSideWindow =
  (selectedVessel: Vessel.AugmentedSelectedVessel): MainAppThunk =>
  dispatch => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
    dispatch(
      focusOnAlert({
        beaconNumber: undefined,
        districtCode: selectedVessel.districtCode,
        externalReferenceNumber: selectedVessel.externalReferenceNumber,
        flagState: selectedVessel.flagState,
        internalReferenceNumber: selectedVessel.internalReferenceNumber,
        ircs: selectedVessel.ircs,
        mmsi: selectedVessel.mmsi,
        name: selectedVessel.alerts?.length ? selectedVessel?.alerts[0] : undefined,
        vesselId: selectedVessel.vesselId,
        vesselIdentifier: selectedVessel.vesselIdentifier,
        vesselLength: selectedVessel.length,
        vesselName: selectedVessel.vesselName
      })
    )
  }
