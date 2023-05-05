import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { VESSEL_STATUS } from '../../../../domain/entities/beaconMalfunction/constants'
import { VesselStatusSelectValue } from '../../../SideWindow/BeaconMalfunctionList/VesselStatusSelectValue'
import { SelectPicker } from 'rsuite'
import updateBeaconMalfunctionFromKanban from '../../../../domain/use_cases/beaconMalfunction/updateBeaconMalfunctionFromKanban'
import { useDispatch } from 'react-redux'
import { ReactComponent as TimeAgoSVG } from '../../../icons/Label_horaire_VMS.svg'
import { getMalfunctionStartDateText } from '../../../../domain/entities/beaconMalfunction'

const CurrentBeaconMalfunctionBody = props => {
  const {
    /** @type {BeaconMalfunctionResumeAndDetails} */
    currentBeaconMalfunctionWithDetails
  } = props
  const dispatch = useDispatch()
  const vesselStatusRef = useRef()
  const vesselStatus = VESSEL_STATUS.find(
    vesselStatus => vesselStatus.value === currentBeaconMalfunctionWithDetails?.beaconMalfunction?.vesselStatus
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
      vesselStatusLastModificationDateTime: new Date().toISOString()
    }

    dispatch(
      updateBeaconMalfunctionFromKanban(beaconMalfunction.id, nextBeaconMalfunction, {
        vesselStatus: nextBeaconMalfunction.vesselStatus
      })
    )
  }

  return currentBeaconMalfunctionWithDetails ? (
    <Body ref={vesselStatusRef}>
      <SelectPicker
        searchable={false}
        value={vesselStatus?.value}
        onChange={status => updateVesselStatus(currentBeaconMalfunctionWithDetails?.beaconMalfunction, status)}
        data={VESSEL_STATUS}
        renderValue={(_, item) => <VesselStatusSelectValue item={item} />}
        cleanable={false}
      />
      <LastPosition
        title={currentBeaconMalfunctionWithDetails?.beaconMalfunction?.malfunctionStartDateTime}
        style={lastPositionStyle}
      >
        <TimeAgo style={timeAgoStyle} />
        {getMalfunctionStartDateText(currentBeaconMalfunctionWithDetails?.beaconMalfunction)}
      </LastPosition>
    </Body>
  ) : null
}

const Body = styled.div`
  margin: 15px 10px 15px 20px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
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
