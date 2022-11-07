import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Layer } from '../../domain/entities/layers/constants'
import showRegulatoryZoneMetadata from '../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'

/**
 * @param {{
 *   mapClickEvent?: any
 * }} props 
 */
const ShowRegulatoryMetadata = ({ mapClickEvent }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (mapClickEvent?.feature) {
      function showRegulatoryZoneMetadataOnClick (feature) {
        if (feature?.getId()?.toString()?.includes(Layer.REGULATORY.code)) {
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
