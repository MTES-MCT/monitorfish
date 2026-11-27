import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { selectAreAISVesselsFetched } from '@features/Vessel/hooks/useDisplayedAISVessels'
import { vesselApi } from '@features/Vessel/vesselApi'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { getNoPositionLabel } from './replayedPositionsStatus'

import type { MainRootState } from '@store'

/** Reads the cached queries of the displayed VMS and AIS vessels: no request is added. */
function selectReplayedQueries(state: MainRootState) {
  const dateTime = selectPositionsDateTime(state)
  if (!dateTime) {
    return undefined
  }

  const vms = vesselApi.endpoints.getVesselsAtDateTime.select(dateTime)(state)
  const ais = selectAreAISVesselsFetched(state)
    ? vesselApi.endpoints.getAISVesselsAtDateTime.select(dateTime)(state)
    : undefined

  return { ais, dateTime, vms }
}

export const selectAreReplayedPositionsLoading = (state: MainRootState): boolean => {
  const queries = selectReplayedQueries(state)

  return !!queries && (queries.vms.isLoading || !!queries.ais?.isLoading)
}

export const selectHaveReplayedPositionsFailed = (state: MainRootState): boolean => {
  const queries = selectReplayedQueries(state)

  return !!queries && (queries.vms.isError || !!queries.ais?.isError)
}

export const selectReplayedPositionsErrorMessage = (state: MainRootState): string | undefined => {
  const queries = selectReplayedQueries(state)
  if (!queries || selectAreReplayedPositionsLoading(state)) {
    return undefined
  }

  if (selectHaveReplayedPositionsFailed(state)) {
    return 'Les positions n’ont pas pu être récupérées.'
  }

  const noPositionLabel = getNoPositionLabel(queries.vms.data, queries.ais?.data)
  if (!noPositionLabel) {
    return undefined
  }

  return `${noPositionLabel} le ${customDayjs(queries.dateTime).utc().format('DD/MM/YYYY à HH:mm')} UTC.`
}
