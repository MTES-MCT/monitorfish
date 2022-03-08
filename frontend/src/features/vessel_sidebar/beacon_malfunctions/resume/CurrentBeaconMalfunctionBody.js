import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { vesselStatuses } from '../../../../domain/entities/beaconStatus'
import { VesselStatusSelectValue } from '../../../side_window/beacon_statuses/VesselStatusSelectValue'
import SelectPicker from 'rsuite/lib/SelectPicker'
import updateBeaconStatusFromKanban from '../../../../domain/use_cases/updateBeaconStatusFromKanban'
import { useDispatch } from 'react-redux'
import * as timeago from 'timeago.js'
import { ReactComponent as TimeAgoSVG } from '../../../icons/Label_horaire_VMS.svg'

const CurrentBeaconMalfunctionBody = props => {
  const {
    /** @type {BeaconStatusWithDetails} */
    currentBeaconMalfunctionWithDetails
  } = props
  const dispatch = useDispatch()
  const vesselStatusRef = useRef()
  const vesselStatus = vesselStatuses.find(vesselStatus => vesselStatus.value === currentBeaconMalfunctionWithDetails?.beaconStatus?.vesselStatus)

  useEffect(() => {
    if (vesselStatus?.color && currentBeaconMalfunctionWithDetails?.beaconStatus?.id) {
      // Target the `select-picker` DOM component
      vesselStatusRef.current.children[0].style.background = vesselStatus.color
      vesselStatusRef.current.children[0].style.setProperty('margin', '0 45px 0 0', 'important')
      // Target the `rs-picker-toggle-value` span DOM component
      vesselStatusRef.current.children[0].firstChild.firstChild.firstChild.style.color = vesselStatus.textColor
    }
  }, [vesselStatus, currentBeaconMalfunctionWithDetails?.beaconStatus])

  const updateVesselStatus = (beaconStatus, status) => {
    const nextBeaconStatus = {
      ...beaconStatus,
      vesselStatus: status,
      vesselStatusLastModificationDateTime: new Date().toISOString()
    }

    dispatch(updateBeaconStatusFromKanban(beaconStatus.id, nextBeaconStatus, {
      vesselStatus: nextBeaconStatus.vesselStatus
    }))
  }

  return currentBeaconMalfunctionWithDetails
    ? <Body ref={vesselStatusRef}>
      <SelectPicker
        searchable={false}
        value={vesselStatus?.value}
        onChange={status => updateVesselStatus(currentBeaconMalfunctionWithDetails?.beaconStatus, status)}
        data={vesselStatuses}
        renderValue={(_, item) => <VesselStatusSelectValue item={item}/>}
        cleanable={false}
      />
      <LastPosition
        title={currentBeaconMalfunctionWithDetails?.beaconStatus?.malfunctionStartDateTime}
        style={lastPositionStyle}
      >
        <TimeAgo style={timeAgoStyle}/>
        Dernière émission {
        timeago.format(currentBeaconMalfunctionWithDetails?.beaconStatus?.malfunctionStartDateTime, 'fr')
          .replace('semaines', 'sem.')
          .replace('semaine', 'sem.')
      }
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
