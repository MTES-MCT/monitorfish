import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MonitorFishWorker'

const worker = new Worker()
const MonitorFishWorker = Comlink.wrap(worker)

const getUniqueSpeciesAndDistricts = vessels => async () => {
  const worker = await new MonitorFishWorker()

  return worker.getUniqueSpeciesAndDistricts(vessels)
}

export default getUniqueSpeciesAndDistricts
