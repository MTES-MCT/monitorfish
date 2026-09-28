import { getAllRegulatoryLayersFromAPI } from '@api/geoserver'
import { renderAdministrativeLayers } from '@features/AdministrativeZone/useCases/renderAdministrativeLayers'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { layerActions } from '@features/Map/layer.slice'
import { selectBaseLayer } from '@features/Map/slice'
import { loadUserLayers } from '@features/UserLayers/useCases/loadUserLayers'
import { saveResolvedUserLayers } from '@features/UserLayers/useCases/saveResolvedUserLayers'
import { getUserLayersFromState } from '@features/UserLayers/utils'
import { Level } from '@mtes-mct/monitor-ui'

import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'
import { regulationActions } from '../slice'

import type { RegulatoryZone } from '../types'
import type { UserLayers } from '@features/UserLayers/types'
import type { MainAppThunk } from '@store'

export const getAllRegulatoryLayers = (): MainAppThunk<Promise<void>> => async (dispatch, getState) => {
  const monitorFishWorker = await MonitorFishWorker
  const { isBackoffice } = getState().global
  const { speciesByCode } = getState().species

  try {
    const features = await getAllRegulatoryLayersFromAPI(isBackoffice)

    const regulatoryZones = await monitorFishWorker.mapGeoserverToRegulatoryZones(features, speciesByCode)
    dispatch(regulationActions.setRegulatoryZones(regulatoryZones))

    const { layersTopicsByRegulatoryTerritory, layersWithoutGeometry } =
      await monitorFishWorker.convertGeoJSONFeaturesToStructuredRegulatoryObject(features, speciesByCode)

    dispatch(regulationActions.setLayersTopicsByRegTerritory(layersTopicsByRegulatoryTerritory))
    dispatch(regulationActions.setRegulatoryLayerLawTypes(layersTopicsByRegulatoryTerritory))

    if (isBackoffice) {
      return
    }

    await dispatch(applyUserLayers(layersWithoutGeometry))
  } catch (error) {
    console.error(error)
    dispatch(
      addMainWindowBanner({
        children: (error as Error).message,
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }
}

/**
 * Apply the user layers to the regulatory zones just fetched.
 *
 * They are loaded from the user profile once: subsequent calls (i.e. from the side window) reuse the current state.
 */
const applyUserLayers =
  (regulatoryZones: RegulatoryZone[]): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { areUserLayersLoaded, showedLayers } = getState().layer
    const { selectedRegulatoryLayers } = getState().regulation

    const userLayers: UserLayers | undefined = areUserLayersLoaded
      ? getUserLayersFromState(showedLayers, selectedRegulatoryLayers, undefined)
      : await dispatch(loadUserLayers())
    if (!userLayers) {
      return
    }

    dispatch(
      regulationActions.setSelectedRegulatoryZone({
        regulatoryZones,
        selectedRegulatoryZoneIds: userLayers.selectedRegulatoryZoneIds
      })
    )
    dispatch(
      layerActions.setShowedLayers({
        administrativeLayers: userLayers.administrativeLayers,
        regulatoryZones,
        showedRegulatoryZoneIds: userLayers.showedRegulatoryZoneIds
      })
    )

    if (areUserLayersLoaded) {
      return
    }

    if (userLayers.baseLayer) {
      dispatch(selectBaseLayer(userLayers.baseLayer))
    }
    dispatch(renderAdministrativeLayers())
    dispatch(layerActions.setAreUserLayersLoaded(true))

    await dispatch(saveResolvedUserLayers(userLayers))
  }
