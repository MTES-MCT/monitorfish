import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setView } from '../domain/reducers/Map'

const MapHistory = ({ map, setShouldUpdateView, shouldUpdateView, historyMoveTrigger }) => {
  const mapState = useSelector(state => state.map)
  const dispatch = useDispatch()

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

  useEffect(() => {
    initMapView()
  }, [map])

  useEffect(() => {
    saveMapView()
  }, [shouldUpdateView, historyMoveTrigger])

  function initMapView () {
    if (map) {
      if (window.location.hash !== '') {
        const hash = window.location.hash.replace('@', '')
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

  function saveMapView () {
    if (map && shouldUpdateView) {
      const center = map.getView().getCenter()
      const view = {
        zoom: map.getView().getZoom().toFixed(2),
        center: center
      }
      const url = `@${center[0].toFixed(2)},${center[1].toFixed(2)},${map.getView().getZoom().toFixed(2)}`

      dispatch(setView(view))
      window.history.pushState(view, 'map', url)
    }
  }

  return null
}

export default MapHistory
