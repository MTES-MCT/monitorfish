import { useEffect } from 'react'

import { LayerProperties } from '../../domain/entities/layers/constants'
import { showRegulatoryZoneMetadata } from '../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'

export type ShowRegulatoryMetadataProps = {
  // hasClickEvent is only used for `BaseMap` to inject `mapClickEvent` props
  // eslint-disable-next-line react/no-unused-prop-types
  hasClickEvent?: boolean
  mapClickEvent?: any
}
export function ShowRegulatoryMetadata({ mapClickEvent }: ShowRegulatoryMetadataProps) {
  const dispatch = useMainAppDispatch()

  useEffect(() => {
    if (!mapClickEvent?.feature) {
      return
    }

    function showRegulatoryZoneMetadataOnClick(feature) {
      if (feature?.getId()?.toString()?.includes(LayerProperties.REGULATORY.code)) {
        const zone = {
          topic: feature.getProperties().topic,
          zone: feature.getProperties().zone
        }
        dispatch(showRegulatoryZoneMetadata(zone, false))
      }
    }

    showRegulatoryZoneMetadataOnClick(mapClickEvent.feature)
  }, [dispatch, mapClickEvent])

  return <></>
}
