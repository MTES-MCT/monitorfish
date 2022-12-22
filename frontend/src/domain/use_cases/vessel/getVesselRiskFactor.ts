import { getVesselRiskFactorFromAPI } from '../../../api/vessel'

export const getVesselRiskFactor = (internalReferenceNumber: string | null | undefined) => () => {
  if (!internalReferenceNumber) {
    return Promise.reject(new Error('No internal reference number given'))
  }

  return getVesselRiskFactorFromAPI(internalReferenceNumber)
}
