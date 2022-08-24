import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getMalfunctionStartDateText, vesselStatuses } from '../../../../domain/entities/beaconMalfunction'
import updateBeaconMalfunctionFromKanban from '../../../../domain/use_cases/beaconMalfunction/updateBeaconMalfunctionFromKanban'
import { ReactComponent as TimeAgoSVG } from '../../../icons/Label_horaire_VMS.svg'
import { VesselStatusSelectValue } from '../../../side_window/beacon_malfunctions/VesselStatusSelectValue'

function CurrentBeaconMalfunctionBody(props) {
  const {
    /** @type {BeaconMalfunctionResumeAndDetails} */
    currentBeaconMalfunctionWithDetails,
  } = props
  const dispatch = useDispatch()
  const vesselStatusRef = useRef()
  const vesselStatus = vesselStatuses.find(
    vesselStatus => vesselStatus.value === currentBeaconMalfunctionWithDetails?.beaconMalfunction?.vesselStatus,
  )

  useEffect(() => {
    if (vesselStatus?.color && currentBeaconMalfunctionWithDetails?.beaconMalfunction?.id) {
      // TODO Use styled-component and avoid useEffect to update these elements style.
      vesselStatusRef.current.querySelector('.rs-picker-select').style.background = vesselStatus.color
      vesselStatusRef.current.querySelector('.rs-picker-select').style.setProperty('margin', '0 45px 0 0', 'important')
      vesselStatusRef.current.querySelector('.rs-picker-toggle-value').style.color = vesselStatus.textColor
    }
  }, [vesselStatus, currentBeaconMalfunctionWithDetails?.beaconMalfunction])

  const updateVesselStatus = (beaconMalfunction, status) => {
    const nextBeaconMalfunction = {
      ...beaconMalfunction,
      vesselStatus: status,
      vesselStatusLastModificationDateTime: new Date().toISOString(),
    }

    dispatch(
      updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
        vesselStatus: nextBeaconMalfunction.vesselStatus,
      }),
    )
  }

  return currentBeaconMalfunctionWithDetails ? (
    <Body ref={vesselStatusRef}>
      <SelectPicker
        cleanable={false}
        data={vesselStatuses}
        onChange={status => updateVesselStatus(currentBeaconMalfunctionWithDetails?.beaconMalfunction, status)}
        renderValue={(_, item) => <VesselStatusSelectValue item={item} />}
        searchable={false}
        value={vesselStatus?.value}
      />
      <LastPosition
        style={lastPositionStyle}
        title={currentBeaconMalfunctionWithDetails?.beaconMalfunction?.malfunctionStartDateTime}
      >
        <TimeAgo style={timeAgoStyle} />
        {getMalfunctionStartDateText(vesselStatus, currentBeaconMalfunctionWithDetails?.beaconMalfunction)}
      </LastPosition>
    </Body>
  ) : null
}

const Body = styled.div`
  margin: 15px 10px 15px 20px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`

const TimeAgo = styled(TimeAgoSVG)``
const timeAgoStyle = {
  marginRight: 5,
  verticalAlign: 'sub',
  width: 15,
}

const LastPosition = styled.div``
const lastPositionStyle = {
  background: `${COLORS.gainsboro} 0% 0% no-repeat padding-box`,
  borderRadius: 1,
  display: 'inline-block',
  fontWeight: 500,
  padding: '5px 8px',
}

export default CurrentBeaconMalfunctionBody
