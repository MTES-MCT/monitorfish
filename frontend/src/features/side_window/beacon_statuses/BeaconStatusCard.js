import React, { useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/styles/RiskFactorBox.style'
import SelectPicker from 'rsuite/lib/SelectPicker'
import { vesselStatuses } from './beaconStatuses'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'
import * as timeago from 'timeago.js'
import { timeagoFrenchLocale } from '../../../utils'
import showVessel from '../../../domain/use_cases/showVessel'
import { useDispatch } from 'react-redux'
import getVesselVoyage from '../../../domain/use_cases/getVesselVoyage'

timeago.register('fr', timeagoFrenchLocale)

const BeaconStatusCard = ({ beaconStatus, updateStageVesselStatus, baseUrl }) => {
  const dispatch = useDispatch()
  const vesselStatus = vesselStatuses.find(vesselStatus => vesselStatus.value === beaconStatus?.vesselStatus)
  const ref = useRef()

  return <Wrapper>
    <Header>
      <Row isFirstRow>
        <Flag rel='preload' src={`${baseUrl}/flags/fr.svg`}/>
        <VesselName>
          {beaconStatus.vesselName || 'Aucun nom'}
        </VesselName>
        <ShowIcon
          onClick={() => {
            const vesselIdentity = { ...beaconStatus, flagState: 'FR' }
            dispatch(showVessel(vesselIdentity, false, false, null))
            dispatch(getVesselVoyage(vesselIdentity, null, false))
          }}
          src={`${window.location.origin}/oeil_affiche.png`}
        />
      </Row>
      <Row>
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
      </Row>
    </Header>
    <Body background={vesselStatus.color} ref={ref}>
      <SelectPicker
        container={() => ref.current}
        menuStyle={{ position: 'relative', marginLeft: -10, marginTop: -48 }}
        style={{ width: 90, margin: '2px 10px 10px 0' }}
        searchable={false}
        value={vesselStatus.value}
        onChange={status => updateStageVesselStatus(beaconStatus, status)}
        data={vesselStatuses}
        renderValue={(_, item) => <VesselStatusSelectValue item={item}/>}
        cleanable={false}
      />
      <Row>
        Dernière émission {
        timeago.format(beaconStatus.malfunctionStartDateTime, 'fr')
          .replace('semaines', 'sem.')
          .replace('semaine', 'sem.')
      }
      </Row>
    </Body>
  </Wrapper>
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ShowIcon = styled.img`
  width: 23px;
  padding-right: 7px;
  float: right;
  flex-shrink: 0;
  height: 30px;
  cursor: pointer;
  margin-left: auto;
  height: 18px;
  cursor: zoom-in;
`

const Row = styled.div`
  display: flex;
  margin: ${props => props.isFirstRow ? 7 : 5}px 0 0 10px;
`

const Wrapper = styled.div`
  border-radius: 2px;
  border: 1px solid ${COLORS.lightGray};
  height: 134px;
  width: 245px;
`

const Header = styled.div`
  padding-bottom: 8px;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const Body = styled.div`
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
    margin: 8px 10px 0 10px !important;
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

const Flag = styled.img`
  height: 14px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 3px;
  cursor: pointer;
`

const VesselName = styled.div`
  font-size: 13px;
  font-weight: 500;
  margin-left: 8px;
  cursor: pointer;
`

const Priority = styled.div`
  height: 19px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  border: 1px solid ${props => props.priority ? COLORS.charcoal : COLORS.lightGray};
  color: ${props => props.priority ? COLORS.gunMetal : COLORS.slateGray};
  background: ${props => props.color};
  line-height: 14px;
  text-align: center;
  border-radius: 2px;
  padding: 3px 9px 0px 9px;
`

export default BeaconStatusCard
