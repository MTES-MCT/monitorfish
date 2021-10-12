import React, { useEffect, useState } from 'react'
import MapMenuOverlay from './overlays/MapMenuOverlay'
import { HIT_PIXEL_TO_TOLERANCE } from '../../constants/constants'
import LayersEnum from '../../domain/entities/layers'

/**
 * Handle map menu - Note that the map parameter is given from
 * the BaseMap component, event if it's not seen in the props passed to MapMenu
 */
const MapMenu = ({ map }) => {
  const [coordinates, setCoordinates] = useState([])
  const [isVessel, setIsVessel] = useState(null)

  useEffect(() => {
    if (map) {
      map.getViewport().addEventListener('contextmenu', function (event) {
        event.preventDefault()

        const pixel = map.getEventPixel(event)
        const feature = map.forEachFeatureAtPixel(pixel, feature => feature, { hitTolerance: HIT_PIXEL_TO_TOLERANCE })

        if (feature?.getId()?.toString()?.includes(LayersEnum.VESSELS.code)) {
          setIsVessel(true)
        } else {
          setIsVessel(false)
        }

        setCoordinates(map.getEventCoordinate(event))
      })
    }
  }, [map])

  return (
    <>
      <MapMenuOverlay map={map} coordinates={coordinates} isVessel={isVessel}/>
      <div />
    </>
  )
}

export default MapMenu
