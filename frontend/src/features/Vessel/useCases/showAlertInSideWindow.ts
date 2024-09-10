import { focusOnAlert } from '@features/SideWindow/Alert/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { SideWindowMenuKey } from 'domain/entities/sideWindow/constants'

import type { Vessel } from '../Vessel.types'
import type { MainAppThunk } from '@store'

export const showAlertInSideWindow =
  (selectedVessel: Vessel.AugmentedSelectedVessel): MainAppThunk =>
  dispatch => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
    dispatch(
      focusOnAlert({
        externalReferenceNumber: selectedVessel.externalReferenceNumber,
        flagState: selectedVessel.flagState,
        internalReferenceNumber: selectedVessel.internalReferenceNumber,
        ircs: selectedVessel.ircs,
        name: selectedVessel?.alerts[0] ?? null
      })
    )
  }
