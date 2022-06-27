import React, { useEffect, useRef } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes_gris.svg'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as TimeAgoSVG } from '../../icons/Label_horaire_VMS.svg'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { Priority, priorityStyle } from './BeaconMalfunctionCard'
import { useDispatch } from 'react-redux'
import { getBeaconCreationOrModificationDate } from './beaconMalfunctions'
import * as timeago from 'timeago.js'
import { closeBeaconMalfunctionInKanban } from '../../../domain/shared_slices/BeaconMalfunction'
import { getDateTime } from '../../../utils'
import {
  getFirstVesselStatus,
  getIsMalfunctioning,
  getMalfunctionStartDateText,
  vesselStatuses
} from '../../../domain/entities/beaconMalfunction'
import BeaconMalfunctionDetailsFollowUp from './BeaconMalfunctionDetailsFollowUp'
import VesselStatusSelectOrEndOfMalfunction from './VesselStatusSelectOrEndOfMalfunction'
import { showVesselFromBeaconMalfunctionsKanban } from '../../../domain/use_cases/vessel/showVesselFromBeaconMalfunctionsKanban'
import SendNotification from './SendNotification'

const BeaconMalfunctionDetails = ({ beaconMalfunctionWithDetails, updateVesselStatus, baseRef }) => {
  const {
    resume,
    beaconMalfunction
  } = beaconMalfunctionWithDetails

  const dispatch = useDispatch()
  const vesselStatus = vesselStatuses.find(vesselMalfunction => vesselMalfunction.value === beaconMalfunction?.vesselStatus)
  const baseUrl = window.location.origin
  const vesselStatusRef = useRef()

  useEffect(() => {
    if (vesselStatus?.color && beaconMalfunction?.id && getIsMalfunctioning(beaconMalfunction?.stage)) {
      vesselStatusRef.current.querySelector('.rs-picker-select').style.background = vesselStatus.color
      vesselStatusRef.current.querySelector('[data-cy="side-window-beacon-malfunctions-vessel-status"]').style.color = vesselStatus.textColor
      vesselStatusRef.current.querySelector('.rs-picker-select').style.setProperty('margin', '2px 10px 10px 0px', 'important')
    }
  }, [vesselStatus, beaconMalfunction, vesselStatusRef])

  const beaconMalfunctionDetailsWrapperStyle = {
    position: 'fixed',
    top: 0,
    height: '100vh',
    background: COLORS.white,
    width: 650,
    right: 0,
    zIndex: 999,
    marginRight: beaconMalfunction ? 0 : -650,
    transition: 'margin-right 0.5s'
  }

  return (
    <BeaconMalfunctionDetailsWrapper
      data-cy={'side-window-beacon-malfunctions-detail'}
      style={beaconMalfunctionDetailsWrapperStyle}
    >
      <FirstHeader style={firstHeaderStyle}>
        <Row style={rowStyle()}>
          <AlertsIcon style={alertsIconStyle}/>
          <Title style={titleStyle}>NON-RÉCEPTION DU VMS</Title>
          <CloseIcon
            style={closeIconStyle}
            onClick={() => dispatch(closeBeaconMalfunctionInKanban())}
          />
        </Row>
        <Row style={rowStyle(10)}>
          {
            beaconMalfunction?.flagState
              ? <Flag
                style={flagStyle}
                rel='preload'
                src={`${baseUrl}/flags/${beaconMalfunction?.flagState.toLowerCase()}.svg`}
              />
              : null
          }
          <VesselName
            data-cy={'side-window-beacon-malfunctions-detail-vessel-name'}
            style={vesselNameStyle}
          >
            {beaconMalfunction?.vesselName || 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber
            data-cy={'side-window-beacon-malfunctions-detail-cfr'}
            style={internalReferenceNumberStyle}
          >
            ({beaconMalfunction?.internalReferenceNumber || 'Aucun CFR'})
          </InternalReferenceNumber>
        </Row>
        <Row style={rowStyle(10)}>
          {
            beaconMalfunction?.riskFactor
              ? <RiskFactorBox
                marginRight={5}
                height={24}
                isBig={true}
                color={getRiskFactorColor(beaconMalfunction?.riskFactor)}
              >
                {parseFloat(beaconMalfunction?.riskFactor).toFixed(1)}
              </RiskFactorBox>
              : null
          }
          <Priority
            data-cy={'side-window-beacon-malfunctions-detail-priority'}
            style={priorityStyle(beaconMalfunction?.priority)}
          >
            {beaconMalfunction?.priority ? 'Prioritaire' : 'Non prioritaire'}
          </Priority>
          <ShowVessel
            data-cy={'side-window-beacon-malfunctions-detail-show-vessel'}
            style={showVesselStyle}
            onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, false))}
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
      </FirstHeader>
      <Line style={lineStyle}/>
      <SecondHeader style={secondHeaderStyle}>
        <FirstColumn style={firstColumnStyle}>
          <Malfunctioning ref={vesselStatusRef}>
            <ColumnTitle style={malfunctioningTextStyle}>
              AVARIE #{beaconMalfunction?.id} - {' '}{getBeaconCreationOrModificationDate(beaconMalfunction)}
            </ColumnTitle>
            <VesselStatusSelectOrEndOfMalfunction
              isAbsolute={true}
              domRef={vesselStatusRef}
              beaconMalfunction={beaconMalfunction}
              vesselStatus={vesselStatus}
              updateVesselStatus={updateVesselStatus}
              isMalfunctioning={getIsMalfunctioning(beaconMalfunction?.stage)}
              baseRef={baseRef}
            />
          </Malfunctioning>
          <LastPosition
            style={lastPositionStyle}
            title={getDateTime(beaconMalfunction?.malfunctionStartDateTime)}
          >
            <TimeAgo style={timeAgoStyle}/>
            {getMalfunctionStartDateText(vesselStatus, beaconMalfunction)}
          </LastPosition>
          <SendNotification
            beaconMalfunction={beaconMalfunction}
            baseRef={baseRef}
          />
        </FirstColumn>
        <SecondColumn style={secondColumnStyle}>
          <ColumnTitle style={malfunctioningTextStyle}>
            AVARIES DE LA DERNIÈRE ANNÉE
          </ColumnTitle>
          <ResumeLine style={resumeLineStyle}>
            <ResumeKey style={resumeKeyStyle}>Nombre d&apos;avaries</ResumeKey>
            <ResumeSubKey style={resumeSubKeyStyle}>en mer</ResumeSubKey>
            <ResumeValue style={resumeValueStyle}>{resume?.numberOfBeaconsAtSea}</ResumeValue>
            <ResumeSubKey style={resumeSubKeyStyle}>à quai</ResumeSubKey>
            <ResumeValue style={resumeValueStyle}>{resume?.numberOfBeaconsAtPort}</ResumeValue>
          </ResumeLine>
          <ResumeLine style={resumeLineStyle}>
            <ResumeKey style={resumeKeyStyle}>Dernière avarie</ResumeKey>
            <ResumeValue style={resumeValueStyle}>
              {timeago.format(resume?.lastBeaconMalfunctionDateTime, 'fr')}{' '}
              ({vesselStatus?.label})
            </ResumeValue>
          </ResumeLine>
          <ResumeLine>
            <ShowHistory
              style={showHistoryStyle}
              onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, true))}>
              voir l&apos;historique
            </ShowHistory>
          </ResumeLine>
        </SecondColumn>
      </SecondHeader>
      <Line style={lineStyle}/>
      <BeaconMalfunctionDetailsFollowUp
        beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}
        vesselStatus={vesselStatus}
        firstStatus={getFirstVesselStatus(beaconMalfunctionWithDetails)}
      />
    </BeaconMalfunctionDetailsWrapper>
  )
}

const ShowHistory = styled.span``
const showHistoryStyle = {
  color: COLORS.slateGray,
  textDecoration: 'underline',
  textDecorationColor: COLORS.slateGray,
  cursor: 'pointer'
}

const ResumeValue = styled.span``
const resumeValueStyle = {
  color: COLORS.gunMetal,
  marginRight: 10,
  fontWeight: 500,
  maxWidth: 130
}

const ResumeKey = styled.div``
const resumeKeyStyle = {
  color: COLORS.slateGray,
  fontSize: 13,
  width: 130
}

const ResumeSubKey = styled.span``
const resumeSubKeyStyle = {
  margin: '0 10px 0 0',
  color: COLORS.slateGray
}

const ResumeLine = styled.span``
const resumeLineStyle = {
  marginBottom: 5,
  display: 'inline-flex'
}

const FirstColumn = styled.div``
const firstColumnStyle = {
  width: 295
}

const SecondColumn = styled.div``
const secondColumnStyle = {
  width: 274,
  borderLeft: `1px solid ${COLORS.lightGray}`,
  paddingLeft: 20
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

const ColumnTitle = styled.div``
const malfunctioningTextStyle = {
  letterSpacing: 0,
  color: COLORS.slateGray,
  textTransform: 'uppercase',
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

const FirstHeader = styled.div``
const firstHeaderStyle = {
  margin: '20px 20px 15px 40px'
}

const SecondHeader = styled.div``
const secondHeaderStyle = {
  margin: '20px 20px 15px 40px',
  display: 'flex'
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

const BeaconMalfunctionDetailsWrapper = styled.div``

export default BeaconMalfunctionDetails
