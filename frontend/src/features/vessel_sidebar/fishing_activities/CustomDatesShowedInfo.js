import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getTrackRequestFromTrackDepth } from '../../../domain/entities/vesselTrackDepth'
import { updateSelectedVesselTrackRequest } from '../../../domain/use_cases/vessel/updateSelectedVesselTrackRequest'
import { getDate } from '../../../utils'

function CustomDatesShowedInfo({ width }) {
  const dispatch = useDispatch()
  const { selectedVesselIdentity, selectedVesselTrackRequest } = useSelector(state => state.vessel)
  const defaultVesselTrackDepth = useSelector(state => state.map.defaultVesselTrackDepth)

  const setToDefaultTrackDepth = useCallback(() => {
    const trackRequest = getTrackRequestFromTrackDepth(defaultVesselTrackDepth)

    dispatch(updateSelectedVesselTrackRequest(selectedVesselIdentity, trackRequest, false, false))
  }, [selectedVesselIdentity])

  return (
    <>
      {selectedVesselTrackRequest?.afterDateTime && selectedVesselTrackRequest?.beforeDateTime ? (
        <Wrapper width={width}>
          <TrackDepthInfo data-cy="custom-dates-showed-text">
            Piste affichée du {getDate(selectedVesselTrackRequest?.afterDateTime.toString()).replace('/20', '/')} au{' '}
            {getDate(selectedVesselTrackRequest?.beforeDateTime.toString()).replace('/20', '/')}
          </TrackDepthInfo>
          <ShowLastPositions data-cy="custom-dates-show-last-positions" onClick={setToDefaultTrackDepth}>
            Afficher les dernières positions
          </ShowLastPositions>
        </Wrapper>
      ) : null}
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

const Wrapper = styled.div`
  width: ${props => (props.width ? props.width : 480)}px;
  margin: 0;
  padding: 10px 10px 10px 10px;
  color: ${p => p.theme.color.gainsboro};
  background: ${COLORS.slateGray};
`

export default CustomDatesShowedInfo
