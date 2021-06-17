import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { EmptyResult } from '../commonStyles/Text.style'
import RegulatoryZoneSelectedLayer from '../regulatory_zones/RegulatoryZoneSelectedLayer'
import showLayer from '../../domain/use_cases/showLayer'
import hideLayers from '../../domain/use_cases/hideLayers'
import showRegulatoryZoneMetadata from '../../domain/use_cases/showRegulatoryZoneMetadata'
import LayersEnum from '../../domain/entities/layers'
import { COLORS } from '../../constants/constants'
import zoomInSubZone from '../../domain/use_cases/zoomInSubZone'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

const LawType = props => {
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const regulatoryZoneMetadata = useSelector(state => state.regulatory.regulatoryZoneMetadata)
  const dispatch = useDispatch()

  const {
    lawType,
    regZoneByLawType,
    showedLayers,
    gears,
    isReadyToShowRegulatoryZones,
    callCloseRegulatoryZoneMetadata
  } = props

  function increaseNumberOfZonesOpened (number) {
    setNumberOfZonesOpened(numberOfZonesOpened + number)
  }

  function decreaseNumberOfZonesOpened (number) {
    const value = numberOfZonesOpened - number
    if (value < 0) {
      setNumberOfZonesOpened(0)
    } else {
      setNumberOfZonesOpened(value)
    }
  }

  function callShowRegulatorySubZoneMetadata (regulatorySubZone) {
    dispatch(showRegulatoryZoneMetadata(regulatorySubZone))
  }

  function callZoomInSubZone (subZone) {
    dispatch(zoomInSubZone(subZone))
  }

  function callShowRegulatoryZone (regulatoryZone) {
    dispatch(showLayer({
      type: LayersEnum.REGULATORY.code,
      zone: regulatoryZone
    }))
  }

  function callHideRegulatoryZone (regulatoryZone) {
    dispatch(hideLayers({
      type: LayersEnum.REGULATORY.code,
      zone: regulatoryZone
    }))
  }

  const displayRegulatoryZoneList = (regulatoryZoneList) => {
    return (<>
      {
        regulatoryZoneList && Object.keys(regulatoryZoneList).length > 0
          ? Object.keys(regulatoryZoneList).map((regulatoryZoneLayerName, index) => {
            return <RegulatoryZoneSelectedLayer
              key={regulatoryZoneLayerName}
              callShowRegulatoryZone={callShowRegulatoryZone}
              callHideRegulatoryZone={callHideRegulatoryZone}
              callShowRegulatorySubZoneMetadata={callShowRegulatorySubZoneMetadata}
              callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
              callZoomInSubZone={callZoomInSubZone}
              showedLayers={showedLayers}
              regulatoryZoneName={regulatoryZoneLayerName}
              increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
              decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
              regulatorySubZones={regulatoryZoneList[regulatoryZoneLayerName]}
              isLastItem={Object.keys(regulatoryZoneList).length === index + 1}
              regulatoryZoneMetadata={regulatoryZoneMetadata}
              gears={gears}
              isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
              allowRemoveZone={false}
            />
          })
          : <EmptyResult>Aucun résultat</EmptyResult>
        }
      </>
    )
  }

  return (<LawTypeContainer>
    <LawTypeName onClick={() => setIsOpen(!isOpen)}>
      <LawTypeText>{lawType}</LawTypeText>
      <ChevronIcon isopen={isOpen}/>
    </LawTypeName>
    {isOpen && <RegulatoryZoneLayerList isOpen={isOpen}>
      {displayRegulatoryZoneList(regZoneByLawType[lawType])}
    </RegulatoryZoneLayerList>}
  </LawTypeContainer>)
}

const LawTypeContainer = styled.div`
  display: flex;
  min-height: 40px;
  flex-direction: column;
  overflow: hidden;
`

const LawTypeName = styled.div`
  display: flex;
  font-size: 16px;
  color: ${COLORS.grayDarkerThree};
  border-bottom: 2px solid ${COLORS.squareBorder};
  text-align: left;
  text-transform: uppercase;
  cursor: pointer;
`

const LawTypeText = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RegulatoryZoneLayerList = styled.ul`
  margin: 0;
  overflow-y: auto;
  flex: 1;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  color: ${COLORS.grayDarkerThree};
  height: ${props => props.isOpen ? 'unset' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition:  all 0.5s;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: ${props => props.isopen ? 'rotate(0deg)' : 'rotate(180deg)'};
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  transition: all 0.5s;
`

export default LawType
