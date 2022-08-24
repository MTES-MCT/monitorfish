import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getTrackRequestFromTrackDepth } from '../../../domain/entities/vesselTrackDepth'
import modifyVesselTrackDepth from '../../../domain/use_cases/vessel/modifyVesselTrackDepth'
import { getDate } from '../../../utils'

function CustomDatesShowedInfo({ width }) {
  const dispatch = useDispatch()
  const { selectedVesselCustomTrackRequest, selectedVesselIdentity } = useSelector(state => state.vessel)
  const defaultVesselTrackDepth = useSelector(state => state.map.defaultVesselTrackDepth)

  const setToDefaultTrackDepth = useCallback(() => {
    const trackRequest = getTrackRequestFromTrackDepth(defaultVesselTrackDepth)

    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))
  }, [selectedVesselIdentity])

  return (
    <>
      {selectedVesselCustomTrackRequest?.afterDateTime && selectedVesselCustomTrackRequest?.beforeDateTime ? (
        <Wrapper width={width}>
          <TrackDepthInfo data-cy="custom-dates-showed-text">
            Piste affichée du {getDate(selectedVesselCustomTrackRequest?.afterDateTime.toString()).replace('/20', '/')}{' '}
            au {getDate(selectedVesselCustomTrackRequest?.beforeDateTime.toString()).replace('/20', '/')}
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
  color: ${COLORS.textWhite};
  text-decoration: underline;

  :hover {
    color: ${COLORS.textWhite};
  }
`

const TrackDepthInfo = styled.span`
  font-weight: 700;
`

const Wrapper = styled.div`
  width: ${props => (props.width ? props.width : 480)}px;
  margin: 0;
  padding: 10px 10px 10px 10px;
  color: ${COLORS.textWhite};
  background: ${COLORS.slateGray};
`

export default CustomDatesShowedInfo
