import { useCallback } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getTrackRequestFromTrackDepth } from '../../../../domain/entities/vesselTrackDepth'
import { updateSelectedVesselTrackRequest } from '../../../../domain/use_cases/vessel/updateSelectedVesselTrackRequest'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { getDate } from '../../../../utils'

type CustomDatesShowedInfoProps = {
  width?: number | undefined
}
export function CustomDatesShowedInfo({ width }: CustomDatesShowedInfoProps) {
  const dispatch = useMainAppDispatch()
  const { selectedVesselIdentity, selectedVesselTrackRequest } = useMainAppSelector(state => state.vessel)
  const defaultVesselTrackDepth = useMainAppSelector(state => state.map.defaultVesselTrackDepth)

  const setToDefaultTrackDepth = useCallback(() => {
    if (!selectedVesselIdentity) {
      return
    }

    const trackRequest = getTrackRequestFromTrackDepth(defaultVesselTrackDepth)

    dispatch(updateSelectedVesselTrackRequest(selectedVesselIdentity, trackRequest, false))
  }, [dispatch, defaultVesselTrackDepth, selectedVesselIdentity])

  return (
    <>
      {selectedVesselTrackRequest?.afterDateTime && selectedVesselTrackRequest?.beforeDateTime && (
        <Wrapper width={width}>
          <TrackDepthInfo data-cy="custom-dates-showed-text">
            Piste affichée du {getDate(selectedVesselTrackRequest?.afterDateTime.toString()).replace('/20', '/')} au{' '}
            {getDate(selectedVesselTrackRequest?.beforeDateTime.toString()).replace('/20', '/')}
          </TrackDepthInfo>
          <ShowLastPositions data-cy="custom-dates-show-last-positions" onClick={setToDefaultTrackDepth}>
            Afficher les dernières positions
          </ShowLastPositions>
        </Wrapper>
      )}
    </>
  )
}

const ShowLastPositions = styled.a`
  float: right;
  cursor: pointer;
  color: ${p => p.theme.color.gainsboro};
  text-decoration: underline;

  :hover {
    color: ${p => p.theme.color.gainsboro};
  }
`

const TrackDepthInfo = styled.span`
  font-weight: 700;
`

const Wrapper = styled.div<{
  width?: number | undefined
}>`
  width: ${p => (p.width ? p.width : 480)}px;
  margin: 0;
  padding: 10px 10px 10px 10px;
  color: ${p => p.theme.color.gainsboro};
  background: ${COLORS.slateGray};
`
