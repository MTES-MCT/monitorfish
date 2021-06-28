import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { EmptyResult } from '../commonStyles/Text.style'
import RegulatoryZoneSelectedLayer from '../regulatory_zones/RegulatoryZoneSelectedLayer'
import { COLORS } from '../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

const LawType = props => {
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const regulatoryZoneMetadata = useSelector(state => state.regulatory.regulatoryZoneMetadata)

  const {
    lawType,
    regZoneByLawType,
    isReadyToShowRegulatoryZones
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

  const displayRegulatoryZoneList = (regulatoryZoneList) => {
    return (
      regulatoryZoneList && Object.keys(regulatoryZoneList).length > 0
        ? Object.keys(regulatoryZoneList).map((regulatoryZoneLayerName, index) => {
          return <RegulatoryZoneSelectedLayer
            key={regulatoryZoneLayerName}
            increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
            decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
            isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
            regulatoryZoneName={regulatoryZoneLayerName}
            regulatorySubZones={regulatoryZoneList[regulatoryZoneLayerName]}
            regulatoryZoneMetadata={regulatoryZoneMetadata}
            isLastItem={Object.keys(regulatoryZoneList).length === index + 1}
            allowRemoveZone={false}
          />
        })
        : <EmptyResult>Aucun résultat</EmptyResult>
    )
  }

  return (<LawTypeContainer>
    <LawTypeName onClick={() => setIsOpen(!isOpen)}>
      <LawTypeText>{lawType}</LawTypeText>
      <ChevronIcon isOpen={isOpen}/>
    </LawTypeName>
    {isOpen && <RegulatoryZoneLayerList isOpen={isOpen}>
      {displayRegulatoryZoneList(regZoneByLawType[lawType])}
    </RegulatoryZoneLayerList>}
  </LawTypeContainer>)
}

const LawTypeContainer = styled.div`
  margin-top: 10px;
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
  padding-bottom: 5px;
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
  overflow-x: unset;
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
  overflow-x: hidden;
  max-width: 100%;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: ${props => props.isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  transition: all 0.5s;
`

export default LawType
