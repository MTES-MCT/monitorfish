import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import RegulatoryZoneSelectedLayer from './RegulatoryZoneSelectedLayer'
import { COLORS } from '../../constants/constants'
import removeRegulatoryZoneFromMySelection from '../../domain/use_cases/removeRegulatoryZoneFromMySelection'
import LayersEnum, { layersType } from '../../domain/entities/layers'
import hideLayers from '../../domain/use_cases/hideLayers'
import { useDispatch, useSelector } from 'react-redux'
import layer from '../../domain/reducers/Layer'
import { ChevronIcon } from '../commonStyles/icons/ChevronIcon.style'

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
  const { layersSidebarOpenedZone } = useSelector(state => state.layer)
  const { setLayersSideBarOpenedZone } = layer[namespace].actions

  useEffect(() => {
    setShowRegulatoryZonesSelected(layersSidebarOpenedZone === layersType.REGULATORY)
  }, [layersSidebarOpenedZone, setShowRegulatoryZonesSelected])

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

  const onTitleClicked = () => {
    if (showRegulatoryZonesSelected) {
      setShowRegulatoryZonesSelected(false)
      dispatch(setLayersSideBarOpenedZone(''))
    } else {
      setShowRegulatoryZonesSelected(true)
      dispatch(setLayersSideBarOpenedZone(layersType.REGULATORY))
    }
  }

  return (
    <>
      <RegulatoryZoneSelectedTitle
        onClick={() => onTitleClicked()}
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
                allowRemoveZone={true}
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
  height: 30px;
  padding-top: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${props => props.showRegulatoryZonesSelected ? '0' : '2px'};
  border-bottom-right-radius: ${props => props.showRegulatoryZonesSelected ? '0' : '2px'};
  background: ${COLORS.charcoal};
  
  animation: ${props => props.regulatoryZonesAddedToMySelection ? 'blink' : ''} 0.3s ease forwards;

  @keyframes blink {
    0%   {
        background: ${COLORS.lightGray};
    }
    20%   {
        background: ${COLORS.grayDarkerTwo};
    }
    40% {
        background: ${COLORS.lightGray};
    }
    60%   {
        background: ${COLORS.lightGray};
    }
    80%   {
        background: ${COLORS.grayDarkerTwo};
    }
    100% {
        background: ${COLORS.lightGray};
    }
  }
  
  color: ${COLORS.gainsboro};
  font-size: 16px;
  cursor: pointer;
  text-align: left;
  padding-left: 20px;
  user-select: none;
`

const RegulatoryZoneSelectedList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 70vh;
  overflow-x: hidden;
  color: ${COLORS.gunMetal};
  
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

export default RegulatoryZoneSelected
