import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'
import SelectPicker from 'rsuite/lib/SelectPicker'
import { vesselStatuses } from './beaconStatuses'
import { VesselStatusSelectValue } from './VesselStatusSelectValue'
import * as timeago from 'timeago.js'
import { timeagoFrenchLocale } from '../../../utils'
import showVessel from '../../../domain/use_cases/showVessel'
import { useDispatch } from 'react-redux'
import getVesselVoyage from '../../../domain/use_cases/getVesselVoyage'
import openBeaconStatus from '../../../domain/use_cases/openBeaconStatus'

timeago.register('fr', timeagoFrenchLocale)

const BeaconStatusCard = ({ beaconStatus, updateStageVesselStatus, baseUrl }) => {
  const dispatch = useDispatch()
  const vesselStatus = vesselStatuses.find(vesselStatus => vesselStatus.value === beaconStatus?.vesselStatus)
  const ref = useRef()

  const rowStyle = isFirstRow => ({
    display: 'flex',
    margin: `${isFirstRow ? 7 : 5}px 0 0 10px`
  })

  useEffect(() => {
    if (vesselStatus.color && beaconStatus?.id) {
      // Target the `select-picker` DOM component
      ref.current.firstChild.style.background = vesselStatus.color
    }
  }, [vesselStatus, beaconStatus])

  return <Wrapper
    data-cy={'side-window-beacon-statuses-card'}
    style={wrapperStyle}
  >
    <Header style={headerStyle}>
      <Row style={rowStyle(true)}>
        <Flag style={flagStyle} rel='preload' src={`${baseUrl}/flags/fr.svg`}/>
        <VesselName
          data-cy={'side-window-beacon-statuses-card-vessel-name'}
          style={vesselNameStyle}
          onClick={() => dispatch(openBeaconStatus({ beaconStatus }))}
        >
          {beaconStatus.vesselName || 'Aucun nom'}
        </VesselName>
        <ShowIcon
          style={showIconStyle}
          alt={'Voir sur la carte'}
          onClick={() => {
            const vesselIdentity = { ...beaconStatus, flagState: 'FR' }
            dispatch(showVessel(vesselIdentity, false, false, null))
            dispatch(getVesselVoyage(vesselIdentity, null, false))
          }}
          src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
        />
      </Row>
      <Row style={rowStyle(false)}>
        <RiskFactorBox
          marginRight={5}
          height={24}
          isBig={true}
          color={getRiskFactorColor(beaconStatus?.riskFactor)}
        >
          {parseFloat(beaconStatus?.riskFactor).toFixed(1)}
        </RiskFactorBox>
        <Priority style={priorityStyle(beaconStatus?.priority)}>
          {beaconStatus?.priority ? 'Prioritaire' : 'Non prioritaire'}
        </Priority>
      </Row>
    </Header>
    <Body ref={ref}>
      <SelectPicker
        container={() => ref.current}
        menuStyle={{ position: 'relative', marginLeft: -10, marginTop: -48 }}
        style={selectPickerStyle}
        searchable={false}
        value={vesselStatus.value}
        onChange={status => updateStageVesselStatus(beaconStatus, status)}
        data={vesselStatuses}
        renderValue={(_, item) => <VesselStatusSelectValue item={item}/>}
        cleanable={false}
      />
      <Row style={rowStyle(false)}>
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

const Row = styled.div``

const Wrapper = styled.div``
const wrapperStyle = {
  borderRadius: 2,
  border: `1px solid ${COLORS.lightGray}`,
  height: 134,
  width: 245
}

const Header = styled.div``
const headerStyle = {
  paddingBottom: 8,
  borderBottom: `1px solid ${COLORS.lightGray}`
}

const Body = styled.div``
const selectPickerStyle = {
  width: 90,
  margin: '2px 10px 10px 0'
}

const Flag = styled.img``
const flagStyle = {
  height: 14,
  display: 'inline-block',
  verticalAlign: 'middle',
  marginTop: 3,
  cursor: 'pointer'
}

const VesselName = styled.div``
const vesselNameStyle = {
  fontSize: 13,
  fontWeight: 500,
  marginLeft: 8,
  cursor: 'pointer'
}

export const Priority = styled.div``
export const priorityStyle = priority => ({
  height: 19,
  fontSize: 14,
  fontWeight: 500,
  display: 'inline-block',
  userSelect: 'none',
  border: `1px solid ${priority ? COLORS.charcoal : COLORS.lightGray}`,
  color: `${priority ? COLORS.gunMetal : COLORS.slateGray}`,
  lineHeight: '14px',
  textAlign: 'center',
  borderRadius: 2,
  padding: '3px 9px 0px 9px'
})

export default BeaconStatusCard
