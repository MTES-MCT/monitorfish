import { getAllRegulatoryLayersFromAPI } from '../../api/fetch'
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'
import { setError } from '../reducers/Global'
import {
  setZoneThemeArray,
  setRegulationBlocArray,
  setSeaFrontArray,
  setLayersNamesByRegTerrory
} from '../reducers/Regulatory'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const getAllRegulatoryZonesByRegTerritory = () => async (dispatch) => {
  const worker = await new MonitorFishWorker()

  return getAllRegulatoryLayersFromAPI()
    .then(features => {
      return worker.convertGeoJSONFeaturesToObjectByRegTerritory(features)
    })
    .then(response => {
      const {
        seaFrontArray,
        zoneThemeArray,
        regulationBlocArray,
        layersNamesByRegTerritory
      } = response

      dispatch(setZoneThemeArray(zoneThemeArray))
      dispatch(setRegulationBlocArray(regulationBlocArray))
      dispatch(setSeaFrontArray(seaFrontArray))
      dispatch(setLayersNamesByRegTerrory(layersNamesByRegTerritory))
    })
    .catch(error => {
      dispatch(setError(error))
    })
}

export default getAllRegulatoryZonesByRegTerritory
