import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { VesselLocation } from '../../../../domain/entities/vessel/vessel'

import type { GeoJSON } from '../../../../domain/types/GeoJSON'

type ZoneSelected = {
  code: string
  feature: GeoJSON.GeoJson
  name: string
}

type ZoneChildren = {
  code: string
  group: string
  groupCode: string
  isSubZone: boolean
  label: string
  name: string
  value: string
}

type ZoneGroupAndChildren = {
  children: ZoneChildren[]
  label: string
  value: string
}

export type VesselListState = {
  countriesFiltered: string[]
  districtsFiltered: string[]
  fleetSegmentsFiltered: string[]
  gearsFiltered: string[]
  lastControlMonthsAgo: number | null
  lastPositionTimeAgoFilter: number
  speciesFiltered: string[]
  vesselsLocationFilter: VesselLocation[]
  vesselsSizeValuesChecked: string[]
  zonesFilter: ZoneGroupAndChildren[]
  zonesSelected: ZoneSelected[]
}
const INITIAL_STATE: VesselListState = {
  countriesFiltered: [],
  districtsFiltered: [],
  fleetSegmentsFiltered: [],
  gearsFiltered: [],
  lastControlMonthsAgo: null,
  lastPositionTimeAgoFilter: 3,
  speciesFiltered: [],
  vesselsLocationFilter: [VesselLocation.SEA, VesselLocation.PORT],
  vesselsSizeValuesChecked: [],
  zonesFilter: [],
  zonesSelected: []
}

const vesselListSlice = createSlice({
  initialState: INITIAL_STATE,
  name: 'vesselList',
  reducers: {
    /**
     * Add a selected zone to filter vessels or regulations
     */
    addZoneSelected(state, action) {
      if (!state.zonesSelected.find(zone => zone.code === action.payload.code)) {
        state.zonesSelected = state.zonesSelected.concat(action.payload)
      }
    },
    /**
     * Remove a selected zone
     */
    removeZoneSelected(state, action) {
      state.zonesSelected = state.zonesSelected.filter(zoneSelected => zoneSelected.code !== action.payload)
    },
    reset(state) {
      state.zonesSelected = []
      state.zonesFilter = []
      state.lastPositionTimeAgoFilter = 3
      state.lastControlMonthsAgo = null
      state.countriesFiltered = []
      state.fleetSegmentsFiltered = []
      state.gearsFiltered = []
      state.speciesFiltered = []
      state.districtsFiltered = []
      state.vesselsSizeValuesChecked = []
      state.vesselsLocationFilter = [VesselLocation.SEA, VesselLocation.PORT]
    },
    setCountriesFiltered(state, action: PayloadAction<string[]>) {
      state.countriesFiltered = action.payload
    },
    setDistrictsFiltered(state, action: PayloadAction<string[]>) {
      state.districtsFiltered = action.payload
    },
    setFleetSegmentsFiltered(state, action: PayloadAction<string[]>) {
      state.fleetSegmentsFiltered = action.payload
    },
    setGearsFiltered(state, action: PayloadAction<string[]>) {
      state.gearsFiltered = action.payload
    },
    setLastControlMonthsAgo(state, action: PayloadAction<number | null>) {
      state.lastControlMonthsAgo = action.payload
    },
    setLastPositionTimeAgoFilter(state, action: PayloadAction<number>) {
      state.lastPositionTimeAgoFilter = action.payload
    },
    setSpeciesFiltered(state, action: PayloadAction<string[]>) {
      state.speciesFiltered = action.payload
    },
    setVesselsLocationFilter(state, action: PayloadAction<VesselLocation[]>) {
      state.vesselsLocationFilter = action.payload
    },
    setVesselsSizeValuesChecked(state, action: PayloadAction<string[]>) {
      state.vesselsSizeValuesChecked = action.payload
    },
    setZonesFilter(state, action: PayloadAction<ZoneGroupAndChildren[]>) {
      state.zonesFilter = action.payload
    },
    setZonesSelected(state, action) {
      state.zonesSelected = action.payload
    }
  }
})

export const {
  addZoneSelected,
  removeZoneSelected,
  reset,
  setCountriesFiltered,
  setDistrictsFiltered,
  setFleetSegmentsFiltered,
  setGearsFiltered,
  setLastControlMonthsAgo,
  setLastPositionTimeAgoFilter,
  setSpeciesFiltered,
  setVesselsLocationFilter,
  setVesselsSizeValuesChecked,
  setZonesFilter,
  setZonesSelected
} = vesselListSlice.actions

export const vesselListReducer = vesselListSlice.reducer
