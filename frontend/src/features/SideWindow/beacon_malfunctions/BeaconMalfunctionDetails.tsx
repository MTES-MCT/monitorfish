import { CSSProperties, useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { COLORS } from '../../../constants/constants'
import { getFirstVesselStatus, getMalfunctionStartDateText } from '../../../domain/entities/beaconMalfunction'
import { VESSEL_STATUS } from '../../../domain/entities/beaconMalfunction/constants'
import { closeBeaconMalfunctionInKanban } from '../../../domain/shared_slices/BeaconMalfunction'
import { showVesselFromBeaconMalfunctionsKanban } from '../../../domain/use_cases/vessel/showVesselFromBeaconMalfunctionsKanban'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { getDateTime } from '../../../utils'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes_gris.svg'
import { ReactComponent as TimeAgoSVG } from '../../icons/Label_horaire_VMS.svg'
import { BeaconMalfunctionDetailsFollowUp } from './BeaconMalfunctionDetailsFollowUp'
import { getBeaconCreationOrModificationDate } from './beaconMalfunctions'
import SendNotification from './SendNotification'
import { VesselStatusSelect } from './VesselStatusSelect'

import type {
  BeaconMalfunction,
  BeaconMalfunctionResumeAndDetails
} from '../../../domain/entities/beaconMalfunction/types'

export type BeaconMalfunctionDetailsProps = {
  beaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails
  updateVesselStatus: (beaconMalfunction: BeaconMalfunction | undefined, status: any) => void
}
export function BeaconMalfunctionDetails({
  beaconMalfunctionWithDetails,
  updateVesselStatus
}: BeaconMalfunctionDetailsProps) {
  const { beaconMalfunction, resume } = beaconMalfunctionWithDetails

  const dispatch = useAppDispatch()
  const vesselStatus = VESSEL_STATUS.find(_vesselStatus => _vesselStatus.value === beaconMalfunction?.vesselStatus)
  const baseUrl = window.location.origin
  const vesselStatusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (vesselStatusRef.current && vesselStatus?.color && beaconMalfunction?.id) {
      // TODO Use styled-component and avoid useEffect to update these elements style.
      const vesselStatusElement = vesselStatusRef.current.querySelector(
        '[data-cy="side-window-beacon-malfunctions-vessel-status"]'
      ) as HTMLElement
      if (vesselStatusElement?.style) {
        vesselStatusElement.style.color = vesselStatus.textColor
      }

      const selectElement = vesselStatusRef.current.querySelector('.rs-picker-select') as HTMLElement
      if (selectElement?.style) {
        selectElement.style.background = vesselStatus.color
        selectElement.style.setProperty('margin', '2px 10px 10px 0px', 'important')
      }
    }
  }, [vesselStatus, beaconMalfunction, vesselStatusRef])

  const beaconMalfunctionDetailsWrapperStyle: CSSProperties = {
    background: COLORS.white,
    height: '100vh',
    marginRight: beaconMalfunction ? 0 : -650,
    position: 'fixed',
    right: 0,
    top: 0,
    transition: 'margin-right 0.5s',
    width: 650,
    zIndex: 999
  }

  return (
    <BeaconMalfunctionDetailsWrapper
      data-cy="side-window-beacon-malfunctions-detail"
      style={beaconMalfunctionDetailsWrapperStyle}
    >
      <FirstHeader style={firstHeaderStyle}>
        <Row style={rowStyle()}>
          <AlertsIcon style={alertsIconStyle} />
          <Title style={titleStyle}>NON-RÉCEPTION DU VMS</Title>
          <CloseIcon onClick={() => dispatch(closeBeaconMalfunctionInKanban())} style={closeIconStyle} />
        </Row>
        <Row style={rowStyle(10)}>
          {beaconMalfunction?.flagState ? (
            <Flag src={`${baseUrl}/flags/${beaconMalfunction?.flagState.toLowerCase()}.svg`} style={flagStyle} />
          ) : null}
          <VesselName data-cy="side-window-beacon-malfunctions-detail-vessel-name" style={vesselNameStyle}>
            {beaconMalfunction?.vesselName || 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber
            data-cy="side-window-beacon-malfunctions-detail-cfr"
            style={internalReferenceNumberStyle}
          >
            ({beaconMalfunction?.internalReferenceNumber || 'Aucun CFR'})
          </InternalReferenceNumber>
          <ShowVessel
            data-cy="side-window-beacon-malfunctions-detail-show-vessel"
            // @ts-ignore
            onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, false))}
            style={showVesselStyle}
          >
            <ShowVesselText style={showVesselTextStyle}>voir le navire sur la carte</ShowVesselText>
            <ShowIcon alt="Voir sur la carte" src={`${baseUrl}/Icone_voir_sur_la_carte.png`} style={showIconStyle} />
          </ShowVessel>
        </Row>
      </FirstHeader>
      <Line style={lineStyle} />
      <SecondHeader style={secondHeaderStyle}>
        <FirstColumn style={firstColumnStyle}>
          <Malfunctioning ref={vesselStatusRef}>
            <ColumnTitle style={malfunctioningTextStyle}>
              AVARIE #{beaconMalfunction?.id} - {getBeaconCreationOrModificationDate(beaconMalfunction)}
            </ColumnTitle>
            {vesselStatus && (
              <VesselStatusSelect
                beaconMalfunction={beaconMalfunction}
                domRef={vesselStatusRef}
                isAbsolute
                isCleanable={false}
                updateVesselStatus={updateVesselStatus}
                vesselStatus={vesselStatus}
              />
            )}
          </Malfunctioning>
          <LastPosition style={lastPositionStyle} title={getDateTime(beaconMalfunction?.malfunctionStartDateTime)}>
            <TimeAgo style={timeAgoStyle} />
            {getMalfunctionStartDateText(beaconMalfunction)}
          </LastPosition>
          <SendNotification beaconMalfunction={beaconMalfunction} />
        </FirstColumn>
        <SecondColumn style={secondColumnStyle}>
          <ColumnTitle style={malfunctioningTextStyle}>AVARIES DE LA DERNIÈRE ANNÉE</ColumnTitle>
          <ResumeLine style={resumeLineStyle}>
            <ResumeKey style={resumeKeyStyle}>Nombre d’avaries</ResumeKey>
            <ResumeSubKey style={resumeSubKeyStyle}>en mer</ResumeSubKey>
            <ResumeValue style={resumeValueStyle}>
              <Ellipsed style={resumeValueIntegerStyle} title={resume?.numberOfBeaconsAtSea.toString()}>
                {resume?.numberOfBeaconsAtSea}
              </Ellipsed>
            </ResumeValue>
            <ResumeSubKey style={resumeSubKeyStyle}>à quai</ResumeSubKey>
            <ResumeValue style={resumeValueStyle}>
              <Ellipsed style={resumeValueIntegerStyle} title={resume?.numberOfBeaconsAtSea.toString()}>
                {resume?.numberOfBeaconsAtPort}
              </Ellipsed>
            </ResumeValue>
          </ResumeLine>
          <ResumeLine style={resumeLineStyle}>
            <ResumeKey style={resumeKeyStyle}>Dernière avarie</ResumeKey>
            <ResumeValue style={resumeValueStyle}>
              {resume?.lastBeaconMalfunctionDateTime && timeago.format(resume?.lastBeaconMalfunctionDateTime, 'fr')} (
              {vesselStatus?.label})
            </ResumeValue>
          </ResumeLine>
          <ResumeLine>
            <ShowHistory
              // @ts-ignore
              onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, true))}
              style={showHistoryStyle}
            >
              voir l’historique
            </ShowHistory>
          </ResumeLine>
        </SecondColumn>
      </SecondHeader>
      <Line style={lineStyle} />
      <BeaconMalfunctionDetailsFollowUp
        beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}
        firstStatus={getFirstVesselStatus(beaconMalfunctionWithDetails)}
        smallSize={false}
      />
    </BeaconMalfunctionDetailsWrapper>
  )
}

const ShowHistory = styled.span``
const showHistoryStyle = {
  color: COLORS.slateGray,
  cursor: 'pointer',
  textDecoration: 'underline',
  textDecorationColor: COLORS.slateGray
}

const ResumeValue = styled.span``
const Ellipsed = styled.span``
const resumeValueStyle: CSSProperties = {
  color: COLORS.gunMetal,
  fontWeight: 500,
  marginRight: 5
}

const resumeValueIntegerStyle: CSSProperties = {
  maxWidth: 25,
  overflow: 'hidden',
  paddingLeft: 5,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

const ResumeKey = styled.div``
const resumeKeyStyle = {
  color: COLORS.slateGray,
  flexShrink: 0,
  fontSize: 13,
  width: 120
}

const ResumeSubKey = styled.span``
const resumeSubKeyStyle = {
  color: COLORS.slateGray,
  margin: '0 0 0 0'
}

const ResumeLine = styled.span``
const resumeLineStyle = {
  display: 'inline-flex',
  marginBottom: 5
}

const FirstColumn = styled.div``
const firstColumnStyle = {
  width: 295
}

const SecondColumn = styled.div``
const secondColumnStyle = {
  borderLeft: `1px solid ${COLORS.lightGray}`,
  paddingLeft: 20,
  width: 274
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ShowIcon = styled.img``
const showIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  marginTop: 2,
  paddingRight: 9,
  width: 20
}

const LastPosition = styled.div``
const lastPositionStyle = {
  background: `${COLORS.gainsboro} 0% 0% no-repeat padding-box`,
  borderRadius: 1,
  display: 'inline-block',
  fontWeight: 500,
  marginBottom: 10,
  padding: '5px 8px'
}

const Malfunctioning = styled.div``

const ColumnTitle = styled.div``
const malfunctioningTextStyle: CSSProperties = {
  color: COLORS.slateGray,
  fontWeight: 500,
  letterSpacing: 0,
  marginBottom: 10,
  textTransform: 'uppercase'
}

const Line = styled.div``
const lineStyle = {
  borderBottom: `1px solid ${COLORS.lightGray}`,
  width: '100%'
}

const ShowVesselText = styled.span``
const showVesselTextStyle = {
  color: COLORS.slateGray,
  font: 'normal normal normal 13px/18px Marianne',
  letterSpacing: 0,
  marginRight: 4,
  textDecoration: 'underline',
  verticalAlign: 'sub'
}

const ShowVessel = styled.div``
const showVesselStyle = {
  cursor: 'pointer',
  marginLeft: 'auto'
}

const Flag = styled.img``
const flagStyle = {
  cursor: 'pointer',
  display: 'inline-block',
  height: 14,
  marginTop: 5,
  verticalAlign: 'middle'
}

const VesselName = styled.div``
const vesselNameStyle = {
  color: COLORS.gunMetal,
  font: 'normal normal bold 16px/22px Marianne',
  marginLeft: 8
}

const InternalReferenceNumber = styled.div``
const internalReferenceNumberStyle = {
  color: COLORS.gunMetal,
  font: 'normal normal normal 16px/22px Marianne',
  marginLeft: 5
}

const CloseIcon = styled(CloseIconSVG)``
const closeIconStyle = {
  cursor: 'pointer',
  height: 20,
  marginLeft: 'auto',
  marginRight: 4,
  marginTop: 6,
  width: 20
}

const Row = styled.div``
const rowStyle: (topMargin?: number) => CSSProperties = (topMargin?: number) => ({
  display: 'flex',
  marginTop: topMargin || 0
})

const FirstHeader = styled.div``
const firstHeaderStyle = {
  margin: '20px 20px 16px 40px'
}

const SecondHeader = styled.div``
const secondHeaderStyle = {
  display: 'flex',
  margin: '20px 20px 16px 40px'
}

const Title = styled.span``
const titleStyle = {
  color: COLORS.slateGray,
  font: 'normal normal bold 22px/31px Marianne',
  letterSpacing: 0,
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
  marginRight: 5,
  verticalAlign: 'sub',
  width: 15
}

const BeaconMalfunctionDetailsWrapper = styled.div``
