import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const searchRegulatoryLayers = (searchFields, regulatoryLayers) => async () => {
  const worker = await new MonitorFishWorker()

  // console.log(getState, 'getState')
  return worker.searchLayers(searchFields, regulatoryLayers, null)
}

export default searchRegulatoryLayers
