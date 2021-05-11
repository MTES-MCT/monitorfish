import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../../workers/MapperWorker'

const worker = new Worker()
const MapperWorker = Comlink.wrap(worker)

const getUniqueSpeciesAndDistricts = vessels => async () => {
  const worker = await new MapperWorker()

  return worker.getUniqueSpeciesAndDistricts(vessels)
}

export default getUniqueSpeciesAndDistricts
