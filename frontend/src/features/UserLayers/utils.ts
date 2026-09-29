import { LayerProperties } from '@features/Map/constants'
import { isNotNullish } from '@utils/isNotNullish'
import { xor } from 'lodash-es'

import type { AdministrativeLayer, UserLayers } from './types'
import type { MonitorFishMap } from '@features/Map/Map.types'
import type { RegulatoryZone } from '@features/Regulation/types'

export const isEmptyUserLayers = (userLayers: UserLayers) =>
  !userLayers.baseLayer &&
  !userLayers.displayedAdministrativeLayers.length &&
  !userLayers.displayedRegulatoryZoneIds.length &&
  !userLayers.selectedRegulatoryZoneIds.length

const haveSameIds = (ids: string[], otherIds: string[]) => xor(ids, otherIds).length === 0

export const haveSameRegulatoryZoneIds = (userLayers: UserLayers, otherUserLayers: UserLayers) =>
  haveSameIds(userLayers.selectedRegulatoryZoneIds, otherUserLayers.selectedRegulatoryZoneIds) &&
  haveSameIds(userLayers.displayedRegulatoryZoneIds, otherUserLayers.displayedRegulatoryZoneIds)

const isRegulatoryLayer = (showedLayer: MonitorFishMap.ShowedLayer) =>
  showedLayer.type === LayerProperties.REGULATORY.code

export const getDisplayedAdministrativeLayers = (showedLayers: MonitorFishMap.ShowedLayer[]): AdministrativeLayer[] =>
  showedLayers
    .filter(showedLayer => !isRegulatoryLayer(showedLayer))
    .map(({ type, zone }) => (type ? { type, zone } : undefined))
    .filter(isNotNullish)

export const getDisplayedRegulatoryZoneIds = (showedLayers: MonitorFishMap.ShowedLayer[]): string[] =>
  showedLayers
    .filter(isRegulatoryLayer)
    .map(regulatoryLayer => regulatoryLayer.id)
    .filter(isNotNullish)
    .map(String)

export const getUserLayersFromState = (
  showedLayers: MonitorFishMap.ShowedLayer[],
  selectedRegulatoryLayers: Record<string, RegulatoryZone[]> | null,
  baseLayer: string | undefined
): UserLayers => ({
  baseLayer,
  displayedAdministrativeLayers: getDisplayedAdministrativeLayers(showedLayers),
  displayedRegulatoryZoneIds: getDisplayedRegulatoryZoneIds(showedLayers),
  selectedRegulatoryZoneIds: Object.values(selectedRegulatoryLayers ?? {})
    .flat()
    .map(regulatoryZone => regulatoryZone.id)
    .filter(isNotNullish)
    .map(String)
})
