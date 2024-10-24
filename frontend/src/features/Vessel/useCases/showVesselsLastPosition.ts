import { reportingIsAnInfractionSuspicion } from '@features/Reporting/utils'
import { VESSELS_VECTOR_LAYER, VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsLayer/constants'
import { buildFeature } from '@features/Vessel/utils'
import { transform } from 'ol/proj'

import { applyFilterToVessels } from './applyFilterToVessels'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { Vessel } from '../../../domain/entities/vessel/vessel'
import { resetIsUpdatingVessels } from '../../../domain/shared_slices/Global'
import getUniqueSpeciesAndDistricts from '../../../domain/use_cases/species/getUniqueSpeciesAndDistricts'
import { customHexToRGB } from '../../../utils'
import { setVessels, setVesselsSpeciesAndDistricts, vesselSelectors } from '../slice'

import type { VesselEnhancedLastPositionWebGLObject, VesselLastPosition } from '../../../domain/entities/vessel/types'
import type { MainAppThunk } from '@store'

export const showVesselsLastPosition =
  (vessels: VesselLastPosition[]): MainAppThunk =>
  async (dispatch, getState) => {
    const showedFilter = getState().filter?.filters?.find(filter => filter.showed)

    const nextVessels = convertToEnhancedLastPositions(vessels)
    await dispatch(setVessels(nextVessels))

    dispatch(applyFilterToVessels())
    if (showedFilter?.color) {
      const [red, green, blue] = customHexToRGB(showedFilter?.color)

      VESSELS_VECTOR_LAYER.updateStyleVariables({
        filterColorBlue: blue,
        filterColorGreen: green,
        filterColorRed: red
      })
    }

    const filteredVessels = vesselSelectors.selectAll(getState().vessel.vessels)
    const features = filteredVessels.map(vessel => buildFeature(vessel))

    VESSELS_VECTOR_SOURCE.clear(true)
    VESSELS_VECTOR_SOURCE.addFeatures(features)

    const speciesAndDistricts = await dispatch(getUniqueSpeciesAndDistricts(vessels))
    dispatch(
      setVesselsSpeciesAndDistricts({
        districts: speciesAndDistricts.districts,
        species: speciesAndDistricts.species
      })
    )
    dispatch(resetIsUpdatingVessels())
  }

function convertToEnhancedLastPositions(vessels: VesselLastPosition[]): VesselEnhancedLastPositionWebGLObject[] {
  return vessels.map(vessel => ({
    ...vessel,
    coordinates: transform([vessel.longitude, vessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION),
    course: vessel.course,
    filterPreview: 0,
    flagState: vessel.flagState,
    fleetSegmentsArray: vessel.segments ? vessel.segments.map(segment => segment.replace(' ', '')) : [],
    gearsArray: vessel.gearOnboard ? Array.from(new Set(vessel.gearOnboard.map(gear => gear.gear))) : [],
    hasAlert: !!vessel.alerts?.length,
    hasBeaconMalfunction: !!vessel.beaconMalfunctionId,
    hasInfractionSuspicion:
      vessel.reportings?.some(reportingType => reportingIsAnInfractionSuspicion(reportingType)) || false,
    isAtPort: vessel.isAtPort,
    isFiltered: 0,
    lastControlDateTimeTimestamp: vessel.lastControlDateTime ? new Date(vessel.lastControlDateTime).getTime() : '',
    lastPositionSentAt: new Date(vessel.dateTime).getTime(),
    speciesArray: vessel.speciesOnboard
      ? Array.from(new Set(vessel.speciesOnboard.map(species => species.species)))
      : [],
    speed: vessel.speed,
    vesselFeatureId: Vessel.getVesselFeatureId(vessel)
  }))
}
