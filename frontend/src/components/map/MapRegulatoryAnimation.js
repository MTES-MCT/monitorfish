import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LayersEnum from '../../domain/entities/layers'
import showRegulatoryZoneMetadata from '../../domain/use_cases/showRegulatoryZoneMetadata'

const MapVesselAnimation = ({ map, mapClickEvent }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (mapClickEvent) {
      showRegulatoryZoneMetadataOnClick(mapClickEvent)
    }
  }, [map, mapClickEvent])

  function showRegulatoryZoneMetadataOnClick (feature) {
    if (feature && feature.getId() && feature.getId().toString().includes(LayersEnum.REGULATORY.code)) {
      const zone = {
        layerName: feature.getProperties().layer_name,
        zone: feature.getProperties().zones
      }
      dispatch(showRegulatoryZoneMetadata(zone))
    }
  }
  return null
}

export default MapVesselAnimation
