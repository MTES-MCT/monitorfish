import { RtkCacheTagType } from '@api/constants'
import { type Reporting, type ReportingCreation } from '@features/Reporting/types'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { addVesselReporting } from '../../Vessel/slice'
import { reportingApi } from '../reportingApi'

import type { MainAppThunk } from '@store'

export const addReporting =
  (newReporting: ReportingCreation): MainAppThunk<Promise<Reporting.Reporting | undefined>> =>
  async (dispatch, getState) => {
    const { selectedVesselIdentity } = getState().vessel

    try {
      const createdReporting = await dispatch(reportingApi.endpoints.createReporting.initiate(newReporting)).unwrap()

      // We wait for the transaction to be committed
      setTimeout(() => {
        dispatch(reportingApi.util.invalidateTags([{ type: RtkCacheTagType.Reportings }]))
      }, 1000)

      if (selectedVesselIdentity) {
        dispatch(
          addVesselReporting({
            reportingType: newReporting?.type,
            vesselFeatureId: VesselFeature.getVesselFeatureId(selectedVesselIdentity)
          })
        )
      }

      dispatch(renderVesselFeatures())

      return createdReporting
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => addReporting(newReporting),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )

      return undefined
    }
  }
