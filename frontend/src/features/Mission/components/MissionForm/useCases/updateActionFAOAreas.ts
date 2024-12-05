import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { faoAreasApi } from '@api/faoAreas'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export const updateActionFAOAreas =
  (dispatch, setFieldValue: (field: string, value: any) => void) =>
  async (missionAction: MissionActionFormValues): Promise<string[]> => {
    const { data: computedVesselFaoAreas } = await dispatch(
      faoAreasApi.endpoints.computeVesselFaoAreas.initiate(
        {
          internalReferenceNumber: missionAction.internalReferenceNumber,
          latitude: missionAction.latitude,
          longitude: missionAction.longitude,
          portLocode: missionAction.portLocode
        },
        RTK_FORCE_REFETCH_QUERY_OPTIONS
      )
    )

    setFieldValue('faoAreas', computedVesselFaoAreas)

    return computedVesselFaoAreas
  }
