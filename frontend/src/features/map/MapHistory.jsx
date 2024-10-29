import { useEffect } from 'react'
import { getLocalStorageState } from '../../utils'
import { isNumeric } from '../../utils/isNumeric'
import { monitorfishMap } from './monitorfishMap'

const savedMapExtentLocalStorageKey = 'mapExtent'
const savedMapViewLocalStorageKey = 'mapView'
/**
 * Handle browser and LocalStorage history on map URL
 */
const MapHistory = ({ setShouldUpdateView, shouldUpdateView, historyMoveTrigger }) => {
  useEffect(() => {
    // restore view on browser history navigation
    window.addEventListener('popstate', event => {
      if (event.state === null) {
        return
      }

      monitorfishMap.getView().setCenter(event.state.center)
      monitorfishMap.getView().setZoom(event.state.zoom)
      setShouldUpdateView(false)
    })
  }, [setShouldUpdateView])

  useEffect(() => {
    const mapState = {
      view: getLocalStorageState({
        zoom: null,
        center: null
      }, savedMapViewLocalStorageKey),
      extent: getLocalStorageState(null, savedMapExtentLocalStorageKey)
    }
    function initMapView () {
      if (window.location.hash !== '') {
        const hash = window.location.hash.replace('@', '').replace('#', '')
        const viewParts = hash.split(',')
        if (viewParts.length === 3 && isNumeric(viewParts[0]) && isNumeric(viewParts[1]) && isNumeric(viewParts[2])) {
          monitorfishMap.getView().setCenter([parseFloat(viewParts[0]), parseFloat(viewParts[1])])
          monitorfishMap.getView().setZoom(parseFloat(viewParts[2]))
        }
      } else if (mapState) {
        if (mapState.view && mapState.view.center && mapState.view.center[0] && mapState.view.center[1] && mapState.view.zoom) {
          monitorfishMap.getView().setCenter(mapState.view.center)
          monitorfishMap.getView().setZoom(mapState.view.zoom)
        }
      }
    }

    initMapView()
  }, [])

  useEffect(() => {
    function saveMapView () {
      if (shouldUpdateView) {
        const currentView = monitorfishMap.getView()
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
  }, [shouldUpdateView, historyMoveTrigger])

  return null
}

export default MapHistory
