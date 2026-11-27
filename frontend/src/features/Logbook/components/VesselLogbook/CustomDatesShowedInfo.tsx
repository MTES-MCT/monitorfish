import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { getVesselLogbookAtDateTime } from '@features/Logbook/useCases/getVesselLogbookAtDateTime'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { getReplayedTrackRequest } from '@features/PositionReplay/track'
import { updateSelectedVesselTrack } from '@features/Vessel/useCases/updateSelectedVesselTrack'
import { updateVesselTrackAndLogbookFromDates } from '@features/Vessel/useCases/updateVesselTrackAndLogbookFromDates'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, THEME } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { getDate } from '../../../../utils'
import { getTrackRequestFromTrackDepth } from '../../../Vessel/types/vesselTrackDepth'

type CustomDatesShowedInfoProps = {
  width?: number | undefined
}
export function CustomDatesShowedInfo({ width }: CustomDatesShowedInfoProps) {
  const dispatch = useMainAppDispatch()
  const { selectedVesselIdentity, selectedVesselTrackRequest } = useMainAppSelector(state => state.vessel)
  const defaultVesselTrackDepth = useMainAppSelector(state => state.map.defaultVesselTrackDepth)
  const positionsDateTime = useMainAppSelector(selectPositionsDateTime)
  const replayedTrackRequest = getReplayedTrackRequest(positionsDateTime)

  // While replaying positions, the default track is also a custom one: the one ending at the replayed date
  const isDefaultReplayedTrack =
    !!replayedTrackRequest &&
    customDayjs(selectedVesselTrackRequest?.afterDateTime).isSame(replayedTrackRequest.afterDateTime) &&
    customDayjs(selectedVesselTrackRequest?.beforeDateTime).isSame(replayedTrackRequest.beforeDateTime)
  const isCustomTrack =
    !!selectedVesselTrackRequest?.afterDateTime &&
    !!selectedVesselTrackRequest?.beforeDateTime &&
    !isDefaultReplayedTrack

  const setToDefaultTrackDepth = useCallback(async () => {
    if (!selectedVesselIdentity) {
      return
    }

    if (positionsDateTime && replayedTrackRequest) {
      await dispatch(updateSelectedVesselTrack(selectedVesselIdentity, replayedTrackRequest))
      await dispatch(getVesselLogbookAtDateTime(selectedVesselIdentity, positionsDateTime))
      await dispatch(displayLogbookMessageOverlays())

      return
    }

    const trackRequest = getTrackRequestFromTrackDepth(defaultVesselTrackDepth)

    await dispatch(updateVesselTrackAndLogbookFromDates(selectedVesselIdentity, trackRequest))
  }, [dispatch, defaultVesselTrackDepth, positionsDateTime, replayedTrackRequest, selectedVesselIdentity])

  return (
    <>
      {isCustomTrack && (
        <Wrapper width={width}>
          <TrackDepthInfo data-cy="custom-dates-showed-text">
            Piste affichée du {getDate(selectedVesselTrackRequest?.afterDateTime.toString()).replace('/20', '/')} au{' '}
            {getDate(selectedVesselTrackRequest?.beforeDateTime.toString()).replace('/20', '/')}
          </TrackDepthInfo>
          <ShowLastPositions data-cy="custom-dates-show-last-positions" onClick={() => void setToDefaultTrackDepth()}>
            {positionsDateTime ? 'Revenir à la date du rejeu' : 'Afficher les dernières positions'}
          </ShowLastPositions>
        </Wrapper>
      )}
    </>
  )
}

const ShowLastPositions = styled.a`
  cursor: pointer;
  color: ${p => p.theme.color.gainsboro};
  float: right;
  text-decoration: underline;

  &:hover {
    color: ${p => p.theme.color.gainsboro};
  }
`

const TrackDepthInfo = styled.span`
  font-weight: 700;
`

const Wrapper = styled.div<{
  width?: number | undefined
}>`
  background: ${THEME.color.slateGray};
  color: ${p => p.theme.color.gainsboro};
  margin: 0;
  padding: 10px 10px 10px 10px;
  width: ${p => (p.width ? p.width : 480)}px;
`
