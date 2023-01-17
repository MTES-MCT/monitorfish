import { useEffect } from 'react'

import { Layer } from '../../domain/entities/layers/constants'
import showRegulatoryZoneMetadata from '../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import { useAppDispatch } from '../../hooks/useAppDispatch'

export type ShowRegulatoryMetadataProps = {
  // hasClickEvent is only used for `BaseMap` to inject `mapClickEvent` props
  // eslint-disable-next-line react/no-unused-prop-types
  hasClickEvent?: boolean
  mapClickEvent?: any
}
export function ShowRegulatoryMetadata({ mapClickEvent }: ShowRegulatoryMetadataProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!mapClickEvent?.feature) {
      return
    }

    function showRegulatoryZoneMetadataOnClick(feature) {
      if (feature?.getId()?.toString()?.includes(Layer.REGULATORY.code)) {
        const zone = {
          topic: feature.getProperties().topic,
          zone: feature.getProperties().zone
        }
        dispatch(showRegulatoryZoneMetadata(zone))
      }
    }

    showRegulatoryZoneMetadataOnClick(mapClickEvent.feature)
  }, [dispatch, mapClickEvent])

  return <></>
}
