import { selectAreAISVesselsFetched } from '@features/Vessel/hooks/useDisplayedAISVessels'
import { useGetAISVesselsAtDateTimeQuery, useGetVesselsAtDateTimeQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, LinkButton } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import styled from 'styled-components'

import { getNoPositionLabel } from '../replayedPositionsStatus'

type ReplayedPositionsStatusProps = Readonly<{
  dateTime: string | undefined
}>
/** Shares the cached queries of the displayed VMS and AIS vessels: no request is added. */
export function ReplayedPositionsStatus({ dateTime }: ReplayedPositionsStatusProps) {
  const areAISVesselsFetched = useMainAppSelector(selectAreAISVesselsFetched)
  const vmsResult = useGetVesselsAtDateTimeQuery(dateTime ?? skipToken)
  const aisResult = useGetAISVesselsAtDateTimeQuery(dateTime ?? skipToken, { skip: !areAISVesselsFetched })

  if (!dateTime) {
    return null
  }

  if (vmsResult.isFetching || aisResult.isFetching) {
    return <Status>Chargement des positions…</Status>
  }

  if (vmsResult.isError || aisResult.isError) {
    const refetchFailedQueries = () => {
      if (vmsResult.isError) {
        vmsResult.refetch()
      }
      if (aisResult.isError) {
        aisResult.refetch()
      }
    }

    return (
      <Status $isError>
        Les positions n’ont pas pu être récupérées. <LinkButton onClick={refetchFailedQueries}>Réessayer</LinkButton>
      </Status>
    )
  }

  const noPositionLabel = getNoPositionLabel(vmsResult.data, areAISVesselsFetched ? aisResult.data : undefined)
  if (!noPositionLabel) {
    return null
  }

  const replayedAt = customDayjs(dateTime).utc()

  return (
    <Status>
      {noPositionLabel} le {replayedAt.format('DD/MM/YYYY à HH:mm')} UTC.
    </Status>
  )
}

const Status = styled.p<{ $isError?: boolean }>`
  align-items: center;
  color: ${p => (p.$isError ? p.theme.color.maximumRed : p.theme.color.gunMetal)} !important;
  display: flex;
  gap: 4px;
  margin-top: 16px !important;
`
