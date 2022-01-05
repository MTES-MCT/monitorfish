import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LayersEnum from '../../domain/entities/layers'
import showRegulatoryZoneMetadata from '../../domain/use_cases/showRegulatoryZoneMetadata'

const ShowRegulatoryMetadata = ({ mapClickEvent }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (mapClickEvent && mapClickEvent.feature) {
      showRegulatoryZoneMetadataOnClick(mapClickEvent.feature)
    }
  }, [mapClickEvent])

  function showRegulatoryZoneMetadataOnClick (feature) {
    if (feature?.getId()?.toString()?.includes(LayersEnum.REGULATORY.code)) {
      const zone = {
        topic: feature.getProperties().layer_name,
        zone: feature.getProperties().zones
      }
      dispatch(showRegulatoryZoneMetadata(zone))
    }
  }

  return null
}

export default React.memo(ShowRegulatoryMetadata)
