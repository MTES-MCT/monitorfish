import { monitorenvControlUnitContactApi } from '@features/ControlUnit/controlUnitContactApi'

import type { ControlUnitContactFormValues } from '../components/ControlUnitDialog/ControlUnitContactList/types'
import type { ControlUnit } from '@mtes-mct/monitor-ui'
import type { MainAppThunk } from '@store'

export const createOrUpdateControlUnitContact =
  (controlUnitContactFormValues: ControlUnitContactFormValues): MainAppThunk<Promise<void>> =>
  async dispatch => {
    if (controlUnitContactFormValues.id === undefined) {
      const newControlUnitContact = controlUnitContactFormValues as ControlUnit.NewControlUnitContactData

      await dispatch(
        monitorenvControlUnitContactApi.endpoints.createControlUnitContact.initiate(newControlUnitContact)
      ).unwrap()

      return
    }

    const nextControlUnitContact = controlUnitContactFormValues as ControlUnit.ControlUnitContactData

    await dispatch(
      monitorenvControlUnitContactApi.endpoints.patchControlUnitContact.initiate(nextControlUnitContact)
    ).unwrap()
  }
