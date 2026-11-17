import { getOperationalAlerts } from '@features/Alert/useCases/getOperationalAlerts'
import { getSilencedAlerts } from '@features/Alert/useCases/getSilencedAlerts'
import { getAllBeaconMalfunctions } from '@features/BeaconMalfunction/useCases/getAllBeaconMalfunctions'
import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { getAllRegulatoryLayers } from '@features/Regulation/useCases/getAllRegulatoryLayers'

import { getAllGearCodes } from '../../../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../../../domain/use_cases/infraction/getInfractions'
import { getAllSpecies } from '../../../domain/use_cases/species/getAllSpecies'

import type { MainAppAsyncThunk, MainAppThunk } from '@store'

export const loadMainWindowReferentials =
  (isSuperUser: boolean): MainAppThunk =>
  dispatch => {
    dispatch(getAllGearCodes<MainAppAsyncThunk>())

    if (isSuperUser) {
      dispatch(fleetSegmentApi.endpoints.getFleetSegments.initiate())
      dispatch(getOperationalAlerts())
      dispatch(getSilencedAlerts())
      dispatch(getAllBeaconMalfunctions())
    }

    dispatch(getInfractions())
    const speciesLoading = dispatch(getAllSpecies<MainAppAsyncThunk>())
    dispatch(getAllRegulatoryLayers(speciesLoading))
  }
