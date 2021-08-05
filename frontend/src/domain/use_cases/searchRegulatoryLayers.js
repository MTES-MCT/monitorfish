import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const searchRegulatoryLayers = (searchFields, regulatoryLayers) => async (dispatch, getState) => {
  const worker = await new MonitorFishWorker()

  return worker.searchLayers(searchFields, regulatoryLayers, getState().gear.gears)
}

export default searchRegulatoryLayers
