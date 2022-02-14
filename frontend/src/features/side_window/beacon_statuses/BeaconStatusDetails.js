import React, { useEffect, useRef } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes_gris.svg'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as TimeAgoSVG } from '../../icons/Label_horaire_VMS.svg'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { Priority, priorityStyle, showVesselOnMap } from './BeaconStatusCard'
import { useDispatch } from 'react-redux'
import { getBeaconCreationOrModificationDate, vesselStatuses } from './beaconStatuses'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'
import SelectPicker from 'rsuite/lib/SelectPicker'
import * as timeago from 'timeago.js'
import { closeBeaconStatus } from '../../../domain/shared_slices/BeaconStatus'
import BeaconStatusDetailsBody from './BeaconStatusDetailsBody'
import { getDateTime } from '../../../utils'

const BeaconStatusDetails = ({ beaconStatus, comments, actions, updateStageVesselStatus }) => {
  const dispatch = useDispatch()
  const vesselStatus = vesselStatuses.find(vesselStatus => vesselStatus.value === beaconStatus?.vesselStatus)
  const baseUrl = window.location.origin
  const ref = useRef()

  useEffect(() => {
    if (vesselStatus?.color && beaconStatus?.id) {
      // Target the `select-picker` DOM component
      ref.current.children[1].style.background = vesselStatus.color
      ref.current.children[1].style.setProperty('margin', '2px 10px 10px 0px', 'important')
    }
  }, [vesselStatus, beaconStatus])

  const beaconStatusDetailsWrapperStyle = {
    position: 'fixed',
    top: 0,
    height: '100vh',
    background: COLORS.white,
    width: 650,
    right: 0,
    zIndex: 999,
    marginRight: beaconStatus ? 0 : -650,
    transition: 'margin-right 0.5s'
  }

  return (
    <BeaconStatusDetailsWrapper
      data-cy={'side-window-beacon-statuses-detail'}
      style={beaconStatusDetailsWrapperStyle}
    >
      <Header style={headerStyle}>
        <Row style={rowStyle()}>
          <AlertsIcon style={alertsIconStyle}/>
          <Title style={titleStyle}>NON-RÉCEPTION DU VMS</Title>
          <CloseIcon
            style={closeIconStyle}
            onClick={() => dispatch(closeBeaconStatus())}
          />
        </Row>
        <Row style={rowStyle(10)}>
          <Flag
            style={flagStyle}
            rel='preload'
            src={`${baseUrl}/flags/fr.svg`}
          />
          <VesselName
            data-cy={'side-window-beacon-statuses-detail-vessel-name'}
            style={vesselNameStyle}
          >
            {beaconStatus?.vesselName || 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber
            data-cy={'side-window-beacon-statuses-detail-cfr'}
            style={internalReferenceNumberStyle}
          >
            ({beaconStatus?.internalReferenceNumber || 'Aucun CFR'})
          </InternalReferenceNumber>
        </Row>
        <Row style={rowStyle(10)}>
          {
            beaconStatus?.riskFactor
              ? <RiskFactorBox
                marginRight={5}
                height={24}
                isBig={true}
                color={getRiskFactorColor(beaconStatus?.riskFactor)}
              >
                {parseFloat(beaconStatus?.riskFactor).toFixed(1)}
              </RiskFactorBox>
              : null
          }
          <Priority
            data-cy={'side-window-beacon-statuses-detail-priority'}
            style={priorityStyle(beaconStatus?.priority)}
          >
            {beaconStatus?.priority ? 'Prioritaire' : 'Non prioritaire'}
          </Priority>
          <ShowVessel
            data-cy={'side-window-beacon-statuses-detail-show-vessel'}
            style={showVesselStyle}
            onClick={() => showVesselOnMap(dispatch, beaconStatus)}
          >
            <ShowVesselText style={showVesselTextStyle}>
              voir le navire sur la carte
            </ShowVesselText>
            <ShowIcon
              style={showIconStyle}
              alt={'Voir sur la carte'}
              src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
            />
          </ShowVessel>
        </Row>
      </Header>
      <Line style={lineStyle}/>
      <Header style={headerStyle}>
        <Malfunctioning style={malfunctioningStyle} ref={ref}>
          <MalfunctioningText style={malfunctioningTextStyle}>
            AVARIE #{beaconStatus?.id} - {' '}{getBeaconCreationOrModificationDate(beaconStatus)}
          </MalfunctioningText>
          <SelectPicker
            container={() => ref.current}
            menuStyle={{ position: 'relative', marginLeft: -10, marginTop: -48 }}
            searchable={false}
            value={vesselStatus?.value}
            onChange={status => updateStageVesselStatus(beaconStatus?.stage, beaconStatus, status)}
            data={vesselStatuses}
            renderValue={(_, item) => <VesselStatusSelectValue item={item}/>}
            cleanable={false}
          />
        </Malfunctioning>
        <LastPosition style={lastPositionStyle} title={getDateTime(beaconStatus?.malfunctionStartDateTime)}>
          <TimeAgo style={timeAgoStyle}/>
          Dernière émission {
          timeago.format(beaconStatus?.malfunctionStartDateTime, 'fr')
        }
        </LastPosition>
      </Header>
      <Line style={lineStyle}/>
      <BeaconStatusDetailsBody
        comments={comments}
        actions={actions}
        beaconStatusId={beaconStatus?.id}
      />
    </BeaconStatusDetailsWrapper>
  )
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ShowIcon = styled.img``
const showIconStyle = {
  width: 20,
  paddingRight: 9,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  marginTop: 2,
  height: 16
}

const LastPosition = styled.div``
const lastPositionStyle = {
  background: `${COLORS.gainsboro} 0% 0% no-repeat padding-box`,
  borderRadius: 1,
  display: 'inline-block',
  padding: '5px 8px',
  marginBottom: 10,
  fontWeight: 500
}

const Malfunctioning = styled.div``
const malfunctioningStyle = {
  paddingTop: 5
}

const MalfunctioningText = styled.div``
const malfunctioningTextStyle = {
  letterSpacing: 0,
  color: COLORS.slateGray,
  textTransform: 'uppercase',
  marginTop: 5,
  marginBottom: 10,
  fontWeight: 500
}

const Line = styled.div``
const lineStyle = {
  width: '100%',
  borderBottom: `1px solid ${COLORS.lightGray}`
}

const ShowVesselText = styled.span``
const showVesselTextStyle = {
  textDecoration: 'underline',
  font: 'normal normal normal 13px/18px Marianne',
  letterSpacing: 0,
  color: COLORS.slateGray,
  marginRight: 4,
  verticalAlign: 'sub'
}

const ShowVessel = styled.div``
const showVesselStyle = {
  marginLeft: 'auto',
  cursor: 'pointer'
}

const Flag = styled.img``
const flagStyle = {
  height: 14,
  display: 'inline-block',
  verticalAlign: 'middle',
  marginTop: 5,
  cursor: 'pointer'
}

const VesselName = styled.div``
const vesselNameStyle = {
  font: 'normal normal bold 16px/22px Marianne',
  marginLeft: 8,
  color: COLORS.gunMetal
}

const InternalReferenceNumber = styled.div``
const internalReferenceNumberStyle = {
  font: 'normal normal normal 16px/22px Marianne',
  marginLeft: 5,
  color: COLORS.gunMetal
}

const CloseIcon = styled(CloseIconSVG)``
const closeIconStyle = {
  width: 20,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 20,
  marginTop: 6,
  marginRight: 4
}

const Row = styled.div``
const rowStyle = topMargin => ({
  display: 'flex',
  marginTop: topMargin || 0
})

const Header = styled.div``
const headerStyle = {
  margin: '15px 20px 15px 40px'
}

const Title = styled.span``
const titleStyle = {
  font: 'normal normal bold 22px/31px Marianne',
  letterSpacing: 0,
  color: COLORS.slateGray,
  marginLeft: 10,
  verticalAlign: 'super'
}

const AlertsIcon = styled(AlertsSVG)``
const alertsIconStyle = {
  marginTop: 4,
  width: 19
}

const TimeAgo = styled(TimeAgoSVG)``
const timeAgoStyle = {
  verticalAlign: 'sub',
  marginRight: 5,
  width: 15
}

const BeaconStatusDetailsWrapper = styled.div``

export default BeaconStatusDetails
