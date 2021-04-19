import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setView } from '../domain/reducers/Map'

const MapHistory = ({ mapRef, map, setShouldUpdateView, shouldUpdateView, historyMoveTrigger }) => {
  const mapState = useSelector(state => state.map)
  const dispatch = useDispatch()

  window.addEventListener('popstate', event => {
    if (event.state === null) {
      return
    }

    if(mapRef.current) {
      mapRef.current.getView().setCenter(event.state.center)
      mapRef.current.getView().setZoom(event.state.zoom)
      setShouldUpdateView(false)
    }
  })

  useEffect(() => {
    initMapView()
  }, [map])

  useEffect(() => {
    saveMapView()
  }, [shouldUpdateView, historyMoveTrigger])

  function initMapView () {
    if (map) {
      if (window.location.hash !== '') {
        let hash = window.location.hash.replace('@', '')
        let viewParts = hash.split(',')
        if (viewParts.length === 3 && !Number.isNaN(viewParts[0]) && !Number.isNaN(viewParts[1]) && !Number.isNaN(viewParts[2])) {
          map.getView().setCenter([parseFloat(viewParts[0]), parseFloat(viewParts[1])])
          map.getView().setZoom(parseFloat(viewParts[2]))
        }
      } else if (mapState) {
        if (mapState.view && mapState.view.center && mapState.view.center[0] && mapState.view.center[1] && mapState.view.zoom) {
          map.getView().setCenter(mapState.view.center)
          map.getView().setZoom(mapState.view.zoom)
        }
      }
    }
  }

  function saveMapView () {
    if (mapRef && mapRef.current && shouldUpdateView) {
      const center = mapRef.current.getView().getCenter()
      let view = {
        zoom: mapRef.current.getView().getZoom().toFixed(2),
        center: center,
      }
      let url = `@${center[0].toFixed(2)},${center[1].toFixed(2)},${mapRef.current.getView().getZoom().toFixed(2)}`

      dispatch(setView(view))
      window.history.pushState(view, 'map', url)
    }
  }

  return null

}

export default MapHistory
