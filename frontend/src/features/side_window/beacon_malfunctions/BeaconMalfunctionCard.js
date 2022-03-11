import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'
import { getBeaconCreationOrModificationDate, getReducedTimeAgo } from './beaconMalfunctions'
import * as timeago from 'timeago.js'
import { timeagoFrenchLocale } from '../../../utils'
import showVessel from '../../../domain/use_cases/showVessel'
import { useDispatch } from 'react-redux'
import getVesselVoyage from '../../../domain/use_cases/getVesselVoyage'
import openBeaconMalfunctionInKanban from '../../../domain/use_cases/openBeaconMalfunctionInKanban'
import { VesselTrackDepth } from '../../../domain/entities/vesselTrackDepth'
import { getIsMalfunctioning, vesselStatuses } from '../../../domain/entities/beaconMalfunction'
import VesselStatusSelectOrEndOfMalfunction from './VesselStatusSelectOrEndOfMalfunction'
import { setSelectedVesselCustomTrackDepth } from '../../../domain/shared_slices/Vessel'

timeago.register('fr', timeagoFrenchLocale)

const BeaconMalfunctionCard = ({ beaconMalfunction, updateVesselStatus, baseUrl, verticalScrollRef }) => {
  const dispatch = useDispatch()
  const vesselStatus = vesselStatuses.find(vesselStatus => vesselStatus.value === beaconMalfunction?.vesselStatus)
  const ref = useRef()

  useEffect(() => {
    if (vesselStatus.color && beaconMalfunction?.id && getIsMalfunctioning(beaconMalfunction?.stage)) {
      // Target the `rs-select-picker` DOM component
      ref.current.firstChild.style.background = vesselStatus.color
      // Target the `rs-picker-toggle-value` span DOM component
      ref.current.firstChild.firstChild.firstChild.firstChild.style.color = vesselStatus.textColor
    }
  }, [vesselStatus, beaconMalfunction, ref])

  return <Wrapper
    data-cy={'side-window-beacon-malfunctions-card'}
    style={wrapperStyle(verticalScrollRef?.current?.scrollHeight > verticalScrollRef?.current?.clientHeight)}
  >
    <Header style={headerStyle}>
      <Row style={rowStyle(true)}>
        <Id
          data-cy={'side-window-vessel-id'}
          style={idStyle}
        >
          #{beaconMalfunction?.id} - {' '}{getBeaconCreationOrModificationDate(beaconMalfunction)}
        </Id>
        <ShowIcon
          style={showIconStyle}
          alt={'Voir sur la carte'}
          onClick={() => showVesselOnMap(dispatch, beaconMalfunction)}
          src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
        />
      </Row>
      <Row style={rowStyle(false)}>
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
          className={'hover-border'}
          data-cy={'side-window-beacon-malfunctions-card-vessel-name'}
          style={vesselNameStyle}
          onClick={() => dispatch(openBeaconMalfunctionInKanban({ beaconMalfunction: beaconMalfunction }))}
        >
          {beaconMalfunction.vesselName || 'Aucun nom'}
        </VesselName>
      </Row>
      <Row style={rowStyle(false)}>
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
        <Priority style={priorityStyle(beaconMalfunction?.priority)}>
          {beaconMalfunction?.priority ? 'Prioritaire' : 'Non prioritaire'}
        </Priority>
      </Row>
    </Header>
    <Body ref={ref}>
      <VesselStatusSelectOrEndOfMalfunction
        domRef={ref}
        beaconMalfunction={beaconMalfunction}
        vesselStatus={vesselStatus}
        updateVesselStatus={updateVesselStatus}
        isMalfunctioning={getIsMalfunctioning(beaconMalfunction?.stage)}
        showedInCard={true}
      />
      <Row style={rowStyle(false)}>
        Dernière émission {getReducedTimeAgo(beaconMalfunction.malfunctionStartDateTime)}
      </Row>
    </Body>
  </Wrapper>
}

export const showVesselOnMap = async (dispatch, beaconMalfunction) => {
  const afterDateTime = new Date(beaconMalfunction.malfunctionStartDateTime)
  const twentyFiveHours = 25
  afterDateTime.setTime(afterDateTime.getTime() - (twentyFiveHours * 60 * 60 * 1000))
  afterDateTime.setMilliseconds(0)
  const beforeDateTime = new Date(beaconMalfunction.malfunctionStartDateTime)
  beforeDateTime.setMilliseconds(0)

  const vesselTrackDepth = {
    trackDepth: VesselTrackDepth.CUSTOM,
    afterDateTime: afterDateTime,
    beforeDateTime: beforeDateTime
  }
  const vesselIdentity = { ...beaconMalfunction, flagState: 'fr' }
  await dispatch(setSelectedVesselCustomTrackDepth(vesselTrackDepth))
  await dispatch(showVessel(vesselIdentity, false, false))
  dispatch(getVesselVoyage(vesselIdentity, null, false))
}

const Id = styled.div``
const idStyle = {
  color: COLORS.slateGray,
  fontSize: 11
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
  marginTop: 5,
  height: 16
}

const Row = styled.div``
const rowStyle = isFirstRow => ({
  display: 'flex',
  margin: `${isFirstRow ? 4 : 5}px 0 0 10px`,
  height: `${isFirstRow ? '16px' : 'unset'}`
})

const Wrapper = styled.div``
const wrapperStyle = hasScroll => ({
  borderRadius: 2,
  border: `1px solid ${COLORS.lightGray}`,
  height: 150,
  width: hasScroll ? 230 : 245
})

const Header = styled.div``
const headerStyle = {
  paddingBottom: 8,
  borderBottom: `1px solid ${COLORS.lightGray}`
}

const Body = styled.div``

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
  cursor: 'pointer',
  maxWidth: 180,
  overflow: 'hidden',
  height: 20.5,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
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

export default BeaconMalfunctionCard
