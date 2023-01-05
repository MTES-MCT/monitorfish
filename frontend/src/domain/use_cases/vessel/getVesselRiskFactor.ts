import { getVesselRiskFactorFromAPI } from '../../../api/vessel'

export const getVesselRiskFactor = (internalReferenceNumber: string | null | undefined) => async () => {
  if (!internalReferenceNumber) {
    throw new Error('No internal reference number given')
  }

  return getVesselRiskFactorFromAPI(internalReferenceNumber)
}
