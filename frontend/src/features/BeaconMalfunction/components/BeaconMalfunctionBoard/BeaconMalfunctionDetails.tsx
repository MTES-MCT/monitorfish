import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useRef } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { BeaconMalfunctionDetailsFollowUp } from './BeaconMalfunctionDetailsFollowUp'
import { SendNotification } from './SendNotification'
import { getBeaconCreationOrModificationDate } from './utils'
import { VesselStatusSelect } from './VesselStatusSelect'
import { closeBeaconMalfunctionInKanban } from '../../../../domain/shared_slices/BeaconMalfunction'
import { getDateTime } from '../../../../utils'
import CloseIconSVG from '../../../icons/Croix_grise.svg?react'
import AlertsSVG from '../../../icons/Icone_alertes_gris.svg?react'
import TimeAgoSVG from '../../../icons/Label_horaire_VMS.svg?react'
import { showVesselFromBeaconMalfunctionsKanban } from '../../../Vessel/useCases/showVesselFromBeaconMalfunctionsKanban'
import { VESSEL_STATUS } from '../../constants'
import { getFirstVesselStatus, getMalfunctionStartDateText } from '../../utils'

import type { BeaconMalfunction, BeaconMalfunctionResumeAndDetails } from '../../types'

export type BeaconMalfunctionDetailsProps = {
  beaconMalfunctionWithDetails: BeaconMalfunctionResumeAndDetails
  updateVesselStatus: (beaconMalfunction: BeaconMalfunction | undefined, status: any) => void
}
export function BeaconMalfunctionDetails({
  beaconMalfunctionWithDetails,
  updateVesselStatus
}: BeaconMalfunctionDetailsProps) {
  const { beaconMalfunction, resume } = beaconMalfunctionWithDetails

  const dispatch = useMainAppDispatch()
  const vesselStatus = VESSEL_STATUS.find(_vesselStatus => _vesselStatus.value === beaconMalfunction?.vesselStatus)
  const baseUrl = window.location.origin
  const vesselStatusRef = useRef<HTMLDivElement>(null)

  return (
    <BeaconMalfunctionDetailsWrapper
      $withMarginRight={!beaconMalfunction}
      data-cy="side-window-beacon-malfunctions-detail"
    >
      <FirstHeader>
        <Row>
          <AlertsIcon />
          <Title>NON-RÉCEPTION DU VMS</Title>
          <CloseIcon onClick={() => dispatch(closeBeaconMalfunctionInKanban())} />
        </Row>
        <Row $topMargin={10}>
          {beaconMalfunction?.flagState ? (
            <Flag src={`${baseUrl}/flags/${beaconMalfunction?.flagState.toLowerCase()}.svg`} />
          ) : null}
          <VesselName data-cy="side-window-beacon-malfunctions-detail-vessel-name">
            {beaconMalfunction?.vesselName || 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber data-cy="side-window-beacon-malfunctions-detail-cfr">
            ({beaconMalfunction?.internalReferenceNumber || 'Aucun CFR'})
          </InternalReferenceNumber>
          <ShowVessel
            data-cy="side-window-beacon-malfunctions-detail-show-vessel"
            // @ts-ignore
            onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, false))}
          >
            <ShowVesselText>voir le navire sur la carte</ShowVesselText>
            <ShowIcon alt="Voir sur la carte" src={`${baseUrl}/Icone_voir_sur_la_carte.png`} />
          </ShowVessel>
        </Row>
      </FirstHeader>
      <Line />
      <SecondHeader>
        <FirstColumn>
          <Malfunctioning ref={vesselStatusRef}>
            <ColumnTitle>
              AVARIE #{beaconMalfunction?.id} - {getBeaconCreationOrModificationDate(beaconMalfunction)}
            </ColumnTitle>
            {vesselStatus && (
              <VesselStatusSelect
                beaconMalfunction={beaconMalfunction}
                isCleanable={false}
                updateVesselStatus={updateVesselStatus}
                vesselStatus={vesselStatus}
              />
            )}
          </Malfunctioning>
          <LastPosition title={getDateTime(beaconMalfunction?.malfunctionStartDateTime)}>
            <TimeAgo />
            {getMalfunctionStartDateText(beaconMalfunction)}
          </LastPosition>
          <SendNotification beaconMalfunction={beaconMalfunction} />
        </FirstColumn>
        <SecondColumn>
          <ColumnTitle>AVARIES DE LA DERNIÈRE ANNÉE</ColumnTitle>
          <ResumeLine>
            <ResumeKey>Nombre d’avaries</ResumeKey>
            <ResumeSubKey>en mer</ResumeSubKey>
            <ResumeValue>
              <Ellipsed title={resume?.numberOfBeaconsAtSea.toString()}>{resume?.numberOfBeaconsAtSea}</Ellipsed>
            </ResumeValue>
            <ResumeSubKey>à quai</ResumeSubKey>
            <ResumeValue>
              <Ellipsed title={resume?.numberOfBeaconsAtSea.toString()}>{resume?.numberOfBeaconsAtPort}</Ellipsed>
            </ResumeValue>
          </ResumeLine>
          <ResumeLine>
            <ResumeKey>Dernière avarie</ResumeKey>
            <ResumeValue>
              {resume?.lastBeaconMalfunctionDateTime && timeago.format(resume?.lastBeaconMalfunctionDateTime, 'fr')} (
              {vesselStatus?.label})
            </ResumeValue>
          </ResumeLine>
          <ResumeLine>
            <ShowHistory
              // @ts-ignore
              onClick={() => dispatch(showVesselFromBeaconMalfunctionsKanban(beaconMalfunction, true))}
            >
              voir l’historique
            </ShowHistory>
          </ResumeLine>
        </SecondColumn>
      </SecondHeader>
      <Line />
      <BeaconMalfunctionDetailsFollowUp
        beaconMalfunctionWithDetails={beaconMalfunctionWithDetails}
        firstStatus={getFirstVesselStatus(beaconMalfunctionWithDetails)}
        smallSize={false}
      />
    </BeaconMalfunctionDetailsWrapper>
  )
}

const ShowHistory = styled.span`
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
  display: block;
  text-decoration: underline;
  text-decoration-color: ${p => p.theme.color.slateGray};
`

const ResumeValue = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  margin-right: 5px;
`
const Ellipsed = styled.span`
  max-width: 25px;
  overflow: hidden;
  padding-left: 5px;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ResumeKey = styled.div`
  color: ${p => p.theme.color.slateGray};
  flex-shrink: 0;
  font-size: 13px;
  width: 120px;
`

const ResumeSubKey = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin: 0;
`

const ResumeLine = styled.span`
  display: inline-flex;
  margin-bottom: 5px;
`

const FirstColumn = styled.div`
  width: 295px;
`

const SecondColumn = styled.div`
  border-left: 1px solid ${p => p.theme.color.lightGray};
  padding-left: 20px;
  width: 274px;
`

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ShowIcon = styled.img`
  cursor: pointer;
  flex-shrink: 0;
  float: right;
  height: 16px;
  margin-left: auto;
  margin-top: 2px;
  padding-right: 9px;
  width: 20px;
`

const LastPosition = styled.div`
  background: ${p => p.theme.color.gainsboro} 0% 0% no-repeat padding-box;
  border-radius: 1px;
  display: inline-block;
  font-weight: 500;
  margin-bottom: 10px;
  margin-top: 10px;
  padding: 5px 8px;
`

const Malfunctioning = styled.div``

const ColumnTitle = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-weight: 500;
  letter-spacing: 0;
  margin-bottom: 10px;
  text-transform: uppercase;
`

const Line = styled.div`
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  width: 100%;
`

const ShowVesselText = styled.span`
  color: ${p => p.theme.color.slateGray};
  font: normal normal normal 13px/18px Marianne;
  letter-spacing: 0;
  margin-right: 4px;
  text-decoration: underline;
  vertical-align: sub;
`

const ShowVessel = styled.div`
  cursor: pointer;
  margin-left: auto;
`

const Flag = styled.img`
  cursor: pointer;
  display: inline-block;
  height: 14px;
  margin-top: 5px;
  vertical-align: middle;
`

const VesselName = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font: normal normal bold 16px/22px Marianne;
  margin-left: 8px;
`

const InternalReferenceNumber = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font: normal normal normal 16px/22px Marianne;
  margin-left: 5px;
`

const CloseIcon = styled(CloseIconSVG)`
  cursor: pointer;
  height: 20px;
  margin-left: auto;
  margin-right: 4px;
  margin-top: 6px;
  width: 20px;
`

const Row = styled.div<{ $topMargin?: number }>`
  display: flex;
  margin-top: ${p => p.$topMargin ?? 0}px;
`

const FirstHeader = styled.div`
  margin: 20px 20px 16px 40px;
`

const SecondHeader = styled.div`
  display: flex;
  margin: 20px 20px 16px 40px;
`

const Title = styled.span`
  color: ${p => p.theme.color.slateGray};
  font: normal normal bold 22px/31px Marianne;
  letter-spacing: 0;
  margin-left: 10px;
  vertical-align: super;
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 4px;
  width: 19px;
`

const TimeAgo = styled(TimeAgoSVG)`
  margin-right: 5px;
  vertical-align: sub;
  width: 15px;
`

const BeaconMalfunctionDetailsWrapper = styled.div<{ $withMarginRight: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${p => p.theme.color.white};
  height: 100vh;
  margin-right: ${p => (p.$withMarginRight ? -650 : 0)}px;
  position: fixed;
  right: 0;
  top: 0;
  transition: margin-right 0.5s;
  width: 650px;
  z-index: 999;
`
