import { getAllBeaconMalfunctionsFromAPI } from '@api/beaconMalfunction'
import { setBeaconMalfunctions } from 'domain/shared_slices/BeaconMalfunction'
import { setError } from 'domain/shared_slices/Global'

import type { MainAppThunk } from '@store'

export const getAllBeaconMalfunctions = (): MainAppThunk<Promise<void>> => async dispatch => {
  try {
    const beaconMalfunctions = await getAllBeaconMalfunctionsFromAPI()

    dispatch(setBeaconMalfunctions(beaconMalfunctions))
  } catch (err) {
    console.error(err)
    dispatch(setError(err))
  }
}
