import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import RegulatoryZoneSelectedLayer from './RegulatoryZoneSelectedLayer'
import { COLORS } from '../../constants/constants'
import removeRegulatoryZoneFromMySelection from '../../domain/use_cases/removeRegulatoryZoneFromMySelection'
import LayersEnum from '../../domain/entities/layers'
import hideLayers from '../../domain/use_cases/hideLayers'
import { useDispatch, useSelector } from 'react-redux'

const RegulatoryZoneSelected = props => {
  const dispatch = useDispatch()
  const {
    isReadyToShowRegulatoryZones,
    selectedRegulatoryZones,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

  const { namespace } = props

  const [showRegulatoryZonesSelected, setShowRegulatoryZonesSelected] = useState(false)
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const firstUpdate = useRef(true)

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

  const callRemoveRegulatoryZoneFromMySelection = (regulatoryZone, numberOfZones) => {
    decreaseNumberOfZonesOpened(numberOfZones)
    dispatch(hideLayers({
      type: LayersEnum.REGULATORY.code,
      zone: regulatoryZone,
      namespace
    }))
    dispatch(removeRegulatoryZoneFromMySelection(regulatoryZone))
  }

  useEffect(() => {
    if (props.regulatoryZoneMetadata) {
      setShowRegulatoryZonesSelected(true)
    }
  }, [props.regulatoryZoneMetadata])

  useEffect(() => {
    if (firstUpdate) {
      firstUpdate.current = false
    } else {
      if (props.hideZonesListWhenSearching) {
        setShowRegulatoryZonesSelected(false)
      } else {
        setShowRegulatoryZonesSelected(true)
      }
    }
  }, [props.hideZonesListWhenSearching])

  return (
        <>
            <RegulatoryZoneSelectedTitle
                onClick={() => setShowRegulatoryZonesSelected(!showRegulatoryZonesSelected)}
                regulatoryZonesAddedToMySelection={props.regulatoryZonesAddedToMySelection}
                showRegulatoryZonesSelected={showRegulatoryZonesSelected}
            >
                Mes zones réglementaires <ChevronIcon isOpen={showRegulatoryZonesSelected}/>
            </RegulatoryZoneSelectedTitle>
            <RegulatoryZoneSelectedList
                layerLength={Object.keys(selectedRegulatoryZones).length}
                zoneLength={numberOfZonesOpened}
                showRegulatoryZonesSelected={showRegulatoryZonesSelected}
            >
                {
                    selectedRegulatoryZones && Object.keys(selectedRegulatoryZones).length > 0
                      ? Object.keys(selectedRegulatoryZones).map((regulatoryZoneName, index) => {
                        return (<RegulatoryZoneSelectedLayer
                          key={regulatoryZoneName}
                          increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
                          decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
                          isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
                          callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryZoneFromMySelection}
                          regulatoryZoneName={regulatoryZoneName}
                          regulatorySubZones={selectedRegulatoryZones[regulatoryZoneName]}
                          regulatoryZoneMetadata={regulatoryZoneMetadata}
                          isLastItem={Object.keys(selectedRegulatoryZones).length === index + 1}
                          allowRemoveZone={false}
                        />)
                      })
                      : <NoZoneSelected>Aucune zone sélectionnée</NoZoneSelected>
                }
            </RegulatoryZoneSelectedList>
        </>
  )
}

const NoZoneSelected = styled.div`
  color: ${COLORS.grayDarkerTwo};
  margin: 10px;
  font-size: 13px;
`

const RegulatoryZoneSelectedTitle = styled.div`
  height: 27px;
  padding-top: 8px;
  margin-top: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${props => props.showRegulatoryZonesSelected ? '0' : '2px'};
  border-bottom-right-radius: ${props => props.showRegulatoryZonesSelected ? '0' : '2px'};
  background: ${COLORS.grayDarker};
  
  animation: ${props => props.regulatoryZonesAddedToMySelection ? 'blink' : ''} 0.3s ease forwards;

  @keyframes blink {
    0%   {
        background: ${COLORS.grayDarker};
    }
    20%   {
        background: ${COLORS.grayDarkerTwo};
    }
    40% {
        background: ${COLORS.grayDarker};
    }
    60%   {
        background: ${COLORS.grayDarker};
    }
    80%   {
        background: ${COLORS.grayDarkerTwo};
    }
    100% {
        background: ${COLORS.grayDarker};
    }
  }
  
  color: ${COLORS.grayDarkerTwo};
  font-size: 0.8em;
  cursor: pointer;
  font-weight: 500;
  text-align: left;
  padding-left: 15px;
  user-select: none;
`

const RegulatoryZoneSelectedList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 550px;
  overflow-x: hidden;
  color: ${COLORS.grayDarkerThree};
  
  animation: ${props => props.showRegulatoryZonesSelected ? 'regulatory-selected-opening' : 'regulatory-selected-closing'} 0.5s ease forwards;

  @keyframes regulatory-selected-opening {
    0%   {
        height: 0;
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
  }

  @keyframes regulatory-selected-closing {
    0%   {
        opacity: 1;
    }
    100% {
        opacity: 0;
        height: 0;
    }
  }
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  
  animation: ${props => props.isOpen ? 'chevron-zones-opening' : 'chevron-zones-closing'} 0.5s ease forwards;

  @keyframes chevron-zones-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-zones-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default RegulatoryZoneSelected
