import { useEffect } from 'react'

import { Layer } from '../../domain/entities/layers/constants'
import showRegulatoryZoneMetadata from '../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import { useAppDispatch } from '../../hooks/useAppDispatch'

export type ShowRegulatoryMetadataProps = {
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
        dispatch(showRegulatoryZoneMetadata(zone) as any)
      }
    }

    showRegulatoryZoneMetadataOnClick(mapClickEvent.feature)
  }, [dispatch, mapClickEvent])

  return <></>
}
