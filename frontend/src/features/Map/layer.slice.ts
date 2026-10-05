// TODO Review that "double" logic for Layer slice.

import { LayerProperties } from '@features/Map/constants'
import { getLayerNameNormalized } from '@features/Map/utils'
import { findRegulatoryZonesByIds } from '@features/Regulation/utils'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { MonitorFishMap } from './Map.types'

import type { RegulatoryZone } from '@features/Regulation/types'
import type { AdministrativeLayer } from '@features/UserLayers/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type { Pixel } from 'ol/pixel'

export interface LayerState {
  administrativeZonesGeometryCache: Record<string, any>[]
  areUserLayersLoaded: boolean
  isBaseMapCachedLocally: boolean
  lastShowedFeatures: Array<Feature<Geometry>>
  layersSidebarOpenedLayerType: string | undefined
  layersToFeatures: MonitorFishMap.LayerToFeatures[]
  mousePosition: Pixel | undefined
  showedLayers: MonitorFishMap.ShowedLayer[]
}

const INITIAL_STATE: LayerState = {
  administrativeZonesGeometryCache: [],
  areUserLayersLoaded: false,
  isBaseMapCachedLocally: false,
  lastShowedFeatures: [],
  layersSidebarOpenedLayerType: undefined,
  layersToFeatures: [],
  mousePosition: undefined,
  showedLayers: []
}

const layerSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'layer',
  reducers: {
    addAdministrativeZoneGeometryToCache(state, action) {
      state.administrativeZonesGeometryCache = state.administrativeZonesGeometryCache.concat(action.payload)
    },

    /**
     * Show a Regulatory or Administrative layer
     */
    // TODO This `Partial<Map.ShowedLayer>` is really vague and forces many type checks/assertions. It should be more specific.
    addShowedLayer(state, action: PayloadAction<Partial<MonitorFishMap.ShowedLayer>>) {
      const { type, zone } = action.payload

      if (type !== MonitorFishMap.MonitorFishLayer.VESSELS) {
        const searchedLayerName = getLayerNameNormalized({
          topic: 'topic' in action.payload ? action.payload.topic : undefined,
          type,
          zone
        })
        const found = !!state.showedLayers.find(layer => getLayerNameNormalized(layer) === searchedLayerName)

        if (!found) {
          state.showedLayers = [
            ...state.showedLayers,
            {
              id: 'id' in action.payload ? action.payload.id : undefined,
              topic: 'topic' in action.payload && action.payload.topic ? action.payload.topic : undefined,
              type,
              zone: zone ?? undefined
            } satisfies MonitorFishMap.ShowedLayer
          ]
        }
      }
    },

    /**
     * Store layer to feature and simplified feature - To show simplified features if the zoom is low
     */
    pushLayerToFeatures(state, action: PayloadAction<MonitorFishMap.LayerToFeatures>) {
      state.layersToFeatures = state.layersToFeatures.filter(layer => layer.name !== action.payload.name)
      state.layersToFeatures = state.layersToFeatures.concat(action.payload)
    },

    /**
     * Remove a layer and the features
     */
    removeLayerToFeatures(state, action: PayloadAction<string>) {
      state.layersToFeatures = state.layersToFeatures.filter(layer => layer.name !== action.payload)
    },

    /**
     * Remove a Regulatory or Administrative layer
     */
    removeShowedLayer(state, action: PayloadAction<MonitorFishMap.ShowedLayer>) {
      const { topic, type, zone } = action.payload

      if (type === MonitorFishMap.MonitorFishLayer.VESSELS) {
        return
      }

      if (type === LayerProperties.REGULATORY.code) {
        if (zone && topic) {
          state.showedLayers = state.showedLayers.filter(
            layer => !(layer.topic === topic && (layer.zone ? layer.zone === zone : true))
          )
        } else if (topic) {
          state.showedLayers = state.showedLayers.filter(layer => layer.topic !== topic)
        }
      } else {
        state.showedLayers = state.showedLayers.filter(
          layer => !(layer.type === type && (layer.zone ? layer.zone === zone : true))
        )
      }
    },

    setAreUserLayersLoaded(state, action: PayloadAction<boolean>) {
      state.areUserLayersLoaded = action.payload
    },

    setIsBaseMapCachedLocally(state, action: PayloadAction<boolean>) {
      state.isBaseMapCachedLocally = action.payload
    },

    setLastShowedFeatures(state, action: PayloadAction<Array<Feature<Geometry>>>) {
      state.lastShowedFeatures = action.payload
    },

    setLayersSideBarOpenedLayerType(state, action) {
      state.layersSidebarOpenedLayerType = action.payload
    },

    setMousePosition(state, action: PayloadAction<Pixel>) {
      state.mousePosition = action.payload
    },

    /**
     * Set the showed layers, updating the regulatory zones with their latest version (or removing them if deleted)
     */
    setShowedLayers(
      state,
      action: PayloadAction<{
        displayedAdministrativeLayers: AdministrativeLayer[]
        displayedRegulatoryZoneIds: string[]
        regulatoryZones: RegulatoryZone[]
      }>
    ) {
      const { displayedAdministrativeLayers, displayedRegulatoryZoneIds, regulatoryZones } = action.payload

      const showedAdministrativeLayers = displayedAdministrativeLayers.map(
        ({ type, zone }) => ({ type, zone }) satisfies MonitorFishMap.ShowedLayer
      )
      const showedRegulatoryLayers = findRegulatoryZonesByIds(regulatoryZones, displayedRegulatoryZoneIds).map(
        regulatoryZone =>
          ({
            gears: regulatoryZone.gearRegulation,
            id: regulatoryZone.id,
            topic: regulatoryZone.topic,
            type: LayerProperties.REGULATORY.code,
            zone: regulatoryZone.zone
          }) satisfies MonitorFishMap.ShowedLayer
      )

      state.showedLayers = [...showedAdministrativeLayers, ...showedRegulatoryLayers]
    }
  }
})

export const layerActions = layerSlice.actions
export const layerReducer = layerSlice.reducer
