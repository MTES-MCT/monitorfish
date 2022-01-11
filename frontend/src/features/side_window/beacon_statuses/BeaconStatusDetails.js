import React, { useRef } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as AlertsSVG } from '../../icons/Icone_alertes_gris.svg'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as TimeAgoSVG } from '../../icons/Label_horaire_VMS.svg'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/styles/RiskFactorBox.style'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { Priority } from './BeaconStatusCard'
import showVessel from '../../../domain/use_cases/showVessel'
import getVesselVoyage from '../../../domain/use_cases/getVesselVoyage'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { useDispatch } from 'react-redux'
import { vesselStatuses } from './beaconStatuses'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'
import SelectPicker from 'rsuite/lib/SelectPicker'
import * as timeago from 'timeago.js'
import { closeBeaconStatus } from '../../../domain/shared_slices/BeaconStatus'

const BeaconStatusDetails = ({ beaconStatus, updateStageVesselStatus }) => {
  const dispatch = useDispatch()
  const vesselStatus = vesselStatuses.find(vesselStatus => vesselStatus.value === beaconStatus?.vesselStatus)
  const baseUrl = window.location.origin
  const ref = useRef()

  return (
    <BeaconStatusDetailsWrapper isOpen={beaconStatus}>
      <Header>
        <Row>
          <AlertsIcon/>
          <Title>NON-RÉCEPTION DU VMS</Title>
          <CloseIcon
            onClick={() => dispatch(closeBeaconStatus())}
          />
        </Row>
        <Row topMargin={10}>
          <Flag rel='preload' src={`${baseUrl}/flags/fr.svg`}/>
          <VesselName>
            {beaconStatus?.vesselName || 'Aucun nom'}
          </VesselName>
          <InternalReferenceNumber>
            ({beaconStatus?.internalReferenceNumber || 'Aucun CFR'})
          </InternalReferenceNumber>
        </Row>
        <Row topMargin={10}>
          <RiskFactorBox
            marginRight={5}
            height={24}
            isBig={true}
            color={getRiskFactorColor(1.2)}
          >
            {1.2}
          </RiskFactorBox>
          <Priority priority={beaconStatus?.priority}>
            {beaconStatus?.priority ? 'Prioritaire' : 'Non prioritaire'}
          </Priority>
          <ShowVessel
            onClick={() => {
              const vesselIdentity = { ...beaconStatus, flagState: 'FR' }
              dispatch(showVessel(vesselIdentity, false, false, null))
              dispatch(getVesselVoyage(vesselIdentity, null, false))
            }}
          >
            <ShowVesselText>
              voir le navire sur la carte
            </ShowVesselText>
            <ShowIcon
              src={`${baseUrl}/oeil_affiche.png`}
            />
          </ShowVessel>
        </Row>
      </Header>
      <Line/>
      <Header>
        <Malfunctioning background={vesselStatus?.color} ref={ref}>
          <MalfunctioningText>
            AVARIE EN COURS
          </MalfunctioningText>
          <SelectPicker
            container={() => ref.current}
            menuStyle={{ position: 'relative', marginLeft: -10, marginTop: -48 }}
            style={{ width: 90, margin: '2px 10px 10px 0' }}
            searchable={false}
            value={vesselStatus?.value}
            onChange={status => updateStageVesselStatus(beaconStatus?.stage, beaconStatus, status)}
            data={vesselStatuses}
            renderValue={(_, item) => <VesselStatusSelectValue item={item}/>}
            cleanable={false}
          />
        </Malfunctioning>
        <LastPosition>
          <TimeAgo/>
          Dernière émission {
          timeago.format(beaconStatus?.malfunctionStartDateTime, 'fr')
        }
        </LastPosition>
      </Header>
      <Line/>
    </BeaconStatusDetailsWrapper>
  )
}

const LastPosition = styled.div`
  background: ${COLORS.gainsboro} 0% 0% no-repeat padding-box;
  border-radius: 1px;
  width: fit-content;
  padding: 5px 8px;
  margin-top: 10px;
  margin-bottom: 25px;
  font-weight: 500;
`

const Malfunctioning = styled.div`
  padding-top: 5px;

  .rs-btn rs-btn-default rs-picker-toggle {
    background: #1675e0 !important;
  }
  .rs-picker-toggle-wrapper {
    display: block;
  }
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active, .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover, .rs-picker-select-menu-item.rs-picker-select-menu-item-focus, .rs-picker-select-menu-item {
    color: #707785;
    font-size: 13px;
    font-weight: normal;
  }
  .rs-picker-select-menu-items {
    overflow-y: unset;
  }
  .rs-picker-select {
    width: 155px !important;
    margin: 10px 10px 0 0 !important;
    background: ${props => props.background};
    height: 30px;
  }
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn {
    padding-right: 27px;
    padding-left: 10px;
    height: 15px;
    padding-top: 5px;
    padding-bottom: 8px;
  }
  .rs-picker-toggle.rs-btn {
    padding-left: 5px !important;
  }
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret, .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }
`

const MalfunctioningText = styled.div`
  letter-spacing: 0px;
  color: ${COLORS.slateGray};
  text-transform: uppercase;
  margin-top: 5px;
  margin-bottom: 10px;
  font-weight: 500;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const ShowVesselText = styled.span`
  text-decoration: underline;
  font: normal normal normal 13px/18px Marianne;
  letter-spacing: 0px;
  color: ${COLORS.slateGray};
  margin-right: 4px;
  vertical-align: sub;
`

const ShowVessel = styled.div`
  margin-left: auto;
  cursor: pointer;
`

const Flag = styled.img`
  height: 14px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 5px;
  cursor: pointer;
`

const VesselName = styled.div`
  font: normal normal bold 16px/22px Marianne;
  margin-left: 8px;
  color: ${COLORS.gunMetal};
`

const InternalReferenceNumber = styled.div`
  font: normal normal normal 16px/22px Marianne;
  margin-left: 5px;
  color: ${COLORS.gunMetal};
`

const CloseIcon = styled(CloseIconSVG)`
  width: 20px;
  cursor: pointer;
  margin-left: auto;
  height: 20px;
  margin-top: 6px;
  margin-right: 4px;
`

const Row = styled.div`
  display: flex;
  margin-top: ${props => props.topMargin ? props.topMargin : 0}px;
`

const Header = styled.div`
  margin: 15px 20px 15px 40px;
`

const Title = styled.span`
  font: normal normal bold 22px/31px Marianne;
  letter-spacing: 0px;
  color: ${COLORS.slateGray};
  margin-left: 10px;
  vertical-align: super;
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 4px;
  width: 19px;
`

const TimeAgo = styled(TimeAgoSVG)`
  vertical-align: sub;
  margin-right: 5px;
  width: 15px;
`

const BeaconStatusDetailsWrapper = styled.div`
  position: fixed;
  top: 0;
  height: 100vh;
  background: ${COLORS.white};
  width: 590px;
  right: 0;
  z-index: 999;
  margin-right: ${props => props.isOpen ? 0 : -650}px;
  transition: margin-right 0.5s;
`

export default BeaconStatusDetails
