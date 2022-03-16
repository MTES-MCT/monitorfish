import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { getMalfunctionStartDateText, vesselStatuses } from '../../../../domain/entities/beaconMalfunction'
import { VesselStatusSelectValue } from '../../../side_window/beacon_malfunctions/VesselStatusSelectValue'
import SelectPicker from 'rsuite/lib/SelectPicker'
import updateBeaconMalfunctionFromKanban from '../../../../domain/use_cases/updateBeaconMalfunctionFromKanban'
import { useDispatch } from 'react-redux'
import { ReactComponent as TimeAgoSVG } from '../../../icons/Label_horaire_VMS.svg'

const CurrentBeaconMalfunctionBody = props => {
  const {
    /** @type {BeaconMalfunctionResumeAndDetails} */
    currentBeaconMalfunctionWithDetails
  } = props
  const dispatch = useDispatch()
  const vesselStatusRef = useRef()
  const vesselStatus = vesselStatuses.find(vesselStatus => vesselStatus.value === currentBeaconMalfunctionWithDetails?.beaconMalfunction?.vesselStatus)

  useEffect(() => {
    if (vesselStatus?.color && currentBeaconMalfunctionWithDetails?.beaconMalfunction?.id) {
      // Target the `select-picker` DOM component
      vesselStatusRef.current.children[0].style.background = vesselStatus.color
      vesselStatusRef.current.children[0].style.setProperty('margin', '0 45px 0 0', 'important')
      // Target the `rs-picker-toggle-value` span DOM component
      vesselStatusRef.current.children[0].firstChild.firstChild.firstChild.style.color = vesselStatus.textColor
    }
  }, [vesselStatus, currentBeaconMalfunctionWithDetails?.beaconMalfunction])

  const updateVesselStatus = (beaconMalfunction, status) => {
    const nextBeaconMalfunction = {
      ...beaconMalfunction,
      vesselStatus: status,
      vesselStatusLastModificationDateTime: new Date().toISOString()
    }

    dispatch(updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
      vesselStatus: nextBeaconMalfunction.vesselStatus
    }))
  }

  return currentBeaconMalfunctionWithDetails
    ? <Body ref={vesselStatusRef}>
      <SelectPicker
        searchable={false}
        value={vesselStatus?.value}
        onChange={status => updateVesselStatus(currentBeaconMalfunctionWithDetails?.beaconMalfunction, status)}
        data={vesselStatuses}
        renderValue={(_, item) => <VesselStatusSelectValue item={item}/>}
        cleanable={false}
      />
      <LastPosition
        title={currentBeaconMalfunctionWithDetails?.beaconMalfunction?.malfunctionStartDateTime}
        style={lastPositionStyle}
      >
        <TimeAgo style={timeAgoStyle}/>
        {getMalfunctionStartDateText(vesselStatus, currentBeaconMalfunctionWithDetails?.beaconMalfunction)}
      </LastPosition>
    </Body>
    : null
}

const Body = styled.div`
  margin: 15px 20px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`

const TimeAgo = styled(TimeAgoSVG)``
const timeAgoStyle = {
  verticalAlign: 'sub',
  marginRight: 5,
  width: 15
}

const LastPosition = styled.div``
const lastPositionStyle = {
  background: `${COLORS.gainsboro} 0% 0% no-repeat padding-box`,
  borderRadius: 1,
  display: 'inline-block',
  padding: '5px 8px',
  fontWeight: 500
}

export default CurrentBeaconMalfunctionBody
