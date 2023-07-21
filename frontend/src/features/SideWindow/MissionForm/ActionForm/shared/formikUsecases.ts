import { Option } from '@mtes-mct/monitor-ui'

import { faoAreasApi } from '../../../../../api/faoAreas'
import { MissionAction } from '../../../../../domain/types/missionAction'
import { getFleetSegments } from '../../../../../domain/use_cases/vessel/getFleetSegments'
import { MissionActionFormValues } from '../../types'

export const updateSegments =
  (
    dispatch,
    setFieldValue: (field: string, value: any) => void,
    fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[]
  ) =>
  async (values: MissionActionFormValues) => {
    const computedFleetSegments = await dispatch(
      getFleetSegments(
        values.faoAreas,
        values.gearOnboard,
        values.speciesOnboard,
        values.longitude,
        values.latitude,
        values.portLocode
      )
    )

    const nextFleetSegments = fleetSegmentsAsOptions
      .filter(({ value }) => computedFleetSegments?.find(fleetSegment => fleetSegment.segment === value.segment))
      .map(({ value }) => value)

    setFieldValue('segments', nextFleetSegments)
  }

export const updateFAOAreas =
  (dispatch, setFieldValue: (field: string, value: any) => void) => async (values: MissionActionFormValues) => {
    const { data: computedVesselFaoAreas } = await dispatch(
      faoAreasApi.endpoints.computeVesselFaoAreas.initiate({
        internalReferenceNumber: values.internalReferenceNumber,
        latitude: values.latitude,
        longitude: values.longitude
      })
    )

    setFieldValue('faoAreas', computedVesselFaoAreas)
  }
