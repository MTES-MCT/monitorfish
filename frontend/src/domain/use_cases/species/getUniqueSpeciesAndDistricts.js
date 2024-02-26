import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'

const getUniqueSpeciesAndDistricts = vessels => async () => {
  const monitorFishWorker = await MonitorFishWorker()

  return monitorFishWorker.getUniqueSpeciesAndDistricts(vessels)
}

export default getUniqueSpeciesAndDistricts
