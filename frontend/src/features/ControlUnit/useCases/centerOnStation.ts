import { monitorfishMap } from '@features/Map/monitorfishMap'
import { mapActions } from '@features/Map/slice'
import { stationActions } from '@features/Station/slice'
import { FrontendError } from '@libs/FrontendError'
import { fromLonLat } from 'ol/proj'

import { getBufferedExtentFromStations } from '../components/ControlUnitListDialog/utils'

import type { Station } from '@mtes-mct/monitor-ui'

const FIVE_SECONDS = 5000

export const centerOnStation = (stations: Station.Station[] | Station.StationData[]) => dispatch => {
  const highlightedStationIds = stations.map(station => station.id)

  if (stations.length === 1) {
    const station = stations[0]
    if (!station) {
      throw new FrontendError('`station` is undefined.')
    }

    const stationCoordinates = fromLonLat([station.longitude, station.latitude])

    // Add this as a `monitorfishMap` method (vanilla).
    monitorfishMap.getView().animate({ center: stationCoordinates })
  } else {
    const bufferedHighlightedStationsExtent = getBufferedExtentFromStations(stations, 0.5)

    // Move this indirect method to `monitorfishMap` (vanilla).
    dispatch(mapActions.fitToExtent(bufferedHighlightedStationsExtent))
  }

  dispatch(stationActions.highlightStationIds(highlightedStationIds))
  setTimeout(() => {
    dispatch(stationActions.highlightStationIds([]))
  }, FIVE_SECONDS)
}
