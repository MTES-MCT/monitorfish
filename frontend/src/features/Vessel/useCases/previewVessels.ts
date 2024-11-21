import { regulationActions } from '@features/Regulation/slice'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { isNumeric } from '@utils/isNumeric'

import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { setPreviewFilteredVesselsMode } from '../../../domain/shared_slices/Global'
import { animateToExtent } from '../../../domain/shared_slices/Map'
import { getExtentFromGeoJSON } from '../../../utils'
import { setPreviewFilteredVesselsFeatures } from '../slice'

import type { VesselEnhancedLastPositionWebGLObject } from '../../../domain/entities/vessel/types'
import type { MainAppThunk } from '@store'

export const previewVessels =
  (filteredVessels: VesselEnhancedLastPositionWebGLObject[]): MainAppThunk =>
  async (dispatch, getState) => {
    const { zonesSelected } = getState().vesselList
    const vesselFeatureIds = filteredVessels.map(vessel => vessel.vesselFeatureId)

    if (!vesselFeatureIds?.length) {
      return
    }

    dispatch(setPreviewFilteredVesselsFeatures(vesselFeatureIds))
    dispatch(setPreviewFilteredVesselsMode(true))

    if (zonesSelected?.length) {
      // TODO Finish that
      // @ts-ignore
      const extent = getExtentFromGeoJSON(zonesSelected[0]?.feature)
      if (extent?.length && !isNumeric(extent[0]) && !isNumeric(extent[1])) {
        // TODO Migrate to `setSearchedRegulationZoneExtent(nextExtent: [...], withAnimation: true)`
        dispatch(regulationActions.setSearchedRegulationZoneExtent(extent))
        dispatch(animateToExtent())
      }
    }

    dispatch(
      setDisplayedComponents({
        isVesselListModalDisplayed: false
      })
    )

    dispatch(renderVesselFeatures())
  }
