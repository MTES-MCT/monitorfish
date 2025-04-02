import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { vesselIsShowed } from '@features/Vessel/types/vessel'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { Vessel } from '@features/Vessel/Vessel.types'
import { throttle } from 'lodash-es'

import type { ShowedVesselTrack } from '@features/Vessel/types/types'

export const getVesselFeaturesInExtent = throttle(
  (): Vessel.VesselPointFeature[] => {
    const vesselsLayer = monitorfishMap
      .getLayers()
      .getArray()
      // @ts-ignore
      ?.find(olLayer => olLayer.name === MonitorFishMap.MonitorFishLayer.VESSELS)
      // @ts-ignore
      ?.getSource()

    return vesselsLayer?.getFeaturesInExtent(monitorfishMap.getView().calculateExtent()) || []
  },
  250,
  { leading: true, trailing: true }
)

export function filterNonSelectedVessels(
  vesselsTracksShowed: Record<string, ShowedVesselTrack>,
  hideNonSelectedVessels: boolean,
  selectedVesselIdentity: Vessel.VesselIdentity | undefined
) {
  return (feature: Vessel.VesselPointFeature) => {
    const properties = feature.getProperties()
    const vesselTrackShowed = vesselsTracksShowed[getVesselCompositeIdentifier(properties)]

    return hideNonSelectedVessels && selectedVesselIdentity
      ? vesselIsShowed(properties as Vessel.VesselIdentity, vesselTrackShowed, selectedVesselIdentity)
      : true
  }
}

export function isVesselGroupColorDefined(feature: Vessel.VesselPointFeature) {
  return feature.get('groupColorRed') || feature.get('groupColorGreen') || feature.get('groupColorBlue')
}
