import React, { useEffect, useRef, useState } from 'react'
import MapMenuOverlay from './overlays/MapMenuOverlay'
import { HIT_PIXEL_TO_TOLERANCE } from '../../constants/constants'
import { LayerProperties } from '../../domain/entities/layers/constants'
import { useSelector } from 'react-redux'

/**
 * Handle map menu - Note that the map parameter is given from
 * the BaseMap component, event if it's not seen in the props passed to MapMenu
 */
const MapMenu = ({ map }) => {
  const {
    vessels
  } = useSelector(state => state.vessel)
  const [coordinates, setCoordinates] = useState([])
  const vessel = useRef(null)

  useEffect(() => {
    if (map) {
      function showMenu (event) {
        event.preventDefault()

        const pixel = map.getEventPixel(event)
        const feature = map.forEachFeatureAtPixel(pixel, feature => feature, { hitTolerance: HIT_PIXEL_TO_TOLERANCE })
        const clickedFeatureId = feature?.getId()

        if (!clickedFeatureId?.toString()?.includes(LayerProperties.VESSELS.code)) {
          vessel.current = null
          setCoordinates([])
          return
        }

        const clickedVessel = vessels.find(vessel => clickedFeatureId === vessel.vesselFeatureId)
        if (!clickedVessel) {
          return
        }

        vessel.current = clickedVessel
        setCoordinates(feature.getGeometry().getCoordinates())
      }

      map.getViewport().addEventListener('contextmenu', showMenu)

      return () => {
        map.getViewport().removeEventListener('contextmenu', showMenu)
      }
    }
  }, [map, vessels])

  return (
    <>
      <MapMenuOverlay map={map} coordinates={coordinates} vessel={vessel.current}/>
    </>
  )
}

export default MapMenu
