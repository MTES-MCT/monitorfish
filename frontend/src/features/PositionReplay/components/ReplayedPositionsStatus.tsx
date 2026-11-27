import {
  selectAreReplayedPositionsLoading,
  selectHaveReplayedPositionsFailed,
  selectReplayedPositionsErrorMessage
} from '@features/PositionReplay/replayedPositionsQueries'
import { selectAreAISVesselsFetched } from '@features/Vessel/hooks/useDisplayedAISVessels'
import { vesselApi } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Banner, Level, LinkButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type ReplayedPositionsErrorBannerProps = Readonly<{
  dateTime: string
  top: number
}>
export function ReplayedPositionsLoading() {
  const areLoading = useMainAppSelector(selectAreReplayedPositionsLoading)

  return areLoading ? <Loading>Chargement des positions…</Loading> : null
}

export function ReplayedPositionsErrorBanner({ dateTime, top }: ReplayedPositionsErrorBannerProps) {
  const dispatch = useMainAppDispatch()
  const errorMessage = useMainAppSelector(selectReplayedPositionsErrorMessage)
  const haveFailed = useMainAppSelector(selectHaveReplayedPositionsFailed)
  const areAISVesselsFetched = useMainAppSelector(selectAreAISVesselsFetched)

  if (!errorMessage) {
    return null
  }

  const refetch = () => {
    void dispatch(vesselApi.endpoints.getVesselsAtDateTime.initiate(dateTime, { forceRefetch: true, subscribe: false }))
    if (areAISVesselsFetched) {
      void dispatch(
        vesselApi.endpoints.getAISVesselsAtDateTime.initiate(dateTime, { forceRefetch: true, subscribe: false })
      )
    }
  }

  return (
    // A new message is displayed again, even after the previous one was closed
    <Banner key={errorMessage} isClosable level={haveFailed ? Level.ERROR : Level.WARNING} top={`${top}px`}>
      {/* `Banner` doesn't forward `data-cy` */}
      <Message data-cy="replayed-positions-error-banner">
        {errorMessage}
        {haveFailed && <LinkButton onClick={refetch}>Réessayer</LinkButton>}
      </Message>
    </Banner>
  )
}

const Loading = styled.p`
  color: ${p => p.theme.color.gunMetal};
  font-size: 11px;
`

const Message = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 8px;
`
