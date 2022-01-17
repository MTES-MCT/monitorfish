import { useEffect } from 'react'
import { getLocalStorageState } from '../../utils'

const savedMapExtentLocalStorageKey = 'mapExtent'
const savedMapViewLocalStorageKey = 'mapView'
/**
 * Handle browser and LocalStorage history on map URL - Note that the map parameter is given from
 * the BaseMap component, event if it's not seen in the props passed to MapHistory
 */
const MapHistory = ({ map, setShouldUpdateView, shouldUpdateView, historyMoveTrigger }) => {
  useEffect(() => {
    // restore view on browser history navigation
    window.addEventListener('popstate', event => {
      if (event.state === null) {
        return
      }

      if (map) {
        map.getView().setCenter(event.state.center)
        map.getView().setZoom(event.state.zoom)
        setShouldUpdateView(false)
      }
    })
  }, [map, setShouldUpdateView])

  useEffect(() => {
    const mapState = {
      view: getLocalStorageState({
        zoom: null,
        center: null
      }, savedMapViewLocalStorageKey),
      extent: getLocalStorageState(null, savedMapExtentLocalStorageKey)
    }
    function initMapView () {
      if (map) {
        if (window.location.hash !== '') {
          const hash = window.location.hash.replace('@', '').replace('#', '')
          const viewParts = hash.split(',')
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
    initMapView()
  }, [map])

  useEffect(() => {
    function saveMapView () {
      if (map && shouldUpdateView) {
        const currentView = map.getView()
        const center = currentView.getCenter()
        const view = {
          zoom: currentView.getZoom().toFixed(2),
          center: center
        }
        const extent = currentView.calculateExtent()
        window.localStorage.setItem(savedMapViewLocalStorageKey, JSON.stringify(view))
        window.localStorage.setItem(savedMapExtentLocalStorageKey, JSON.stringify(extent))

        const url = `#@${center[0].toFixed(2)},${center[1].toFixed(2)},${view.zoom}`
        window.history.pushState(view, 'map', url)
      }
    }
    saveMapView()
  }, [map, shouldUpdateView, historyMoveTrigger])

  return null
}

export default MapHistory
