import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Layers } from '../../domain/entities/layers/constants'
import showRegulatoryZoneMetadata from '../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'

const ShowRegulatoryMetadata = ({ mapClickEvent }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (mapClickEvent?.feature) {
      function showRegulatoryZoneMetadataOnClick (feature) {
        if (feature?.getId()?.toString()?.includes(Layers.REGULATORY.code)) {
          const zone = {
            topic: feature.getProperties().topic,
            zone: feature.getProperties().zone
          }
          dispatch(showRegulatoryZoneMetadata(zone))
        }
      }

      showRegulatoryZoneMetadataOnClick(mapClickEvent.feature)
    }
  }, [mapClickEvent])

  return null
}

export default ShowRegulatoryMetadata
