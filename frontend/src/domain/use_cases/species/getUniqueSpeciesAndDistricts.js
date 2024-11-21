import { MonitorFishWorker } from '../../../workers/MonitorFishWorker'

export const getUniqueSpeciesAndDistricts = vessels => async () => {
  const monitorFishWorker = await MonitorFishWorker

  return monitorFishWorker.getUniqueSpeciesAndDistricts(vessels)
}
