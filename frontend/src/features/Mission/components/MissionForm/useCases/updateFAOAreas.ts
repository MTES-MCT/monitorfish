import { faoAreasApi } from '@api/faoAreas'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export const updateFAOAreas =
  (dispatch, setFieldValue: (field: string, value: any) => void) =>
  async (missionAction: MissionActionFormValues): Promise<string[]> => {
    const { data: computedVesselFaoAreas } = await dispatch(
      faoAreasApi.endpoints.computeVesselFaoAreas.initiate({
        internalReferenceNumber: missionAction.internalReferenceNumber,
        latitude: missionAction.latitude,
        longitude: missionAction.longitude,
        portLocode: missionAction.portLocode
      })
    )

    setFieldValue('faoAreas', computedVesselFaoAreas)

    return computedVesselFaoAreas
  }
