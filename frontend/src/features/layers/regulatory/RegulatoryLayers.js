import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import RegulatoryLayerTopic from './RegulatoryLayerTopic'
import { COLORS } from '../../../constants/constants'
import removeRegulatoryZoneFromMySelection from '../../../domain/use_cases/removeRegulatoryZoneFromMySelection'
import LayersEnum, { layersType } from '../../../domain/entities/layers'
import hideLayers from '../../../domain/use_cases/hideLayers'
import { useDispatch, useSelector } from 'react-redux'
import layer from '../../../domain/reducers/Layer'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'

const RegulatoryLayers = props => {
  const dispatch = useDispatch()
  const { namespace } = props
  const { setLayersSideBarOpenedZone } = layer[namespace].actions

  const {
    isReadyToShowRegulatoryLayers,
    selectedRegulatoryLayers,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)
  const { layersSidebarOpenedLayer } = useSelector(state => state.layer)

  const [showRegulatoryLayers, setShowRegulatoryLayers] = useState(false)
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const firstUpdate = useRef(true)

  useEffect(() => {
    setShowRegulatoryLayers(layersSidebarOpenedLayer === layersType.REGULATORY)
  }, [layersSidebarOpenedLayer, setShowRegulatoryLayers])

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

  const callRemoveRegulatoryLayerFromMySelection = (regulatoryZone, numberOfZones) => {
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
      setShowRegulatoryLayers(true)
    }
  }, [props.regulatoryZoneMetadata])

  useEffect(() => {
    if (firstUpdate) {
      firstUpdate.current = false
    } else {
      if (props.hideZonesListWhenSearching) {
        setShowRegulatoryLayers(false)
      } else {
        setShowRegulatoryLayers(true)
      }
    }
  }, [props.hideZonesListWhenSearching])

  const onTitleClicked = () => {
    if (showRegulatoryLayers) {
      setShowRegulatoryLayers(false)
      dispatch(setLayersSideBarOpenedZone(''))
    } else {
      setShowRegulatoryLayers(true)
      dispatch(setLayersSideBarOpenedZone(layersType.REGULATORY))
    }
  }

  return (
    <>
      <RegulatoryLayersTitle
        onClick={() => onTitleClicked()}
        regulatoryZonesAddedToMySelection={props.regulatoryZonesAddedToMySelection}
        showRegulatoryZonesSelected={showRegulatoryLayers}
      >
        Mes zones réglementaires <ChevronIcon isOpen={showRegulatoryLayers}/>
      </RegulatoryLayersTitle>
      <RegulatoryLayersList
        layerLength={Object.keys(selectedRegulatoryLayers).length}
        zoneLength={numberOfZonesOpened}
        showRegulatoryZonesSelected={showRegulatoryLayers}
      >
        {
          selectedRegulatoryLayers && Object.keys(selectedRegulatoryLayers).length > 0
            ? Object.keys(selectedRegulatoryLayers).map((regulatoryZoneName, index) => {
              return (<RegulatoryLayerTopic
                key={regulatoryZoneName}
                increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
                decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
                isReadyToShowRegulatoryLayers={isReadyToShowRegulatoryLayers}
                callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryLayerFromMySelection}
                regulatoryZoneName={regulatoryZoneName}
                regulatorySubZones={selectedRegulatoryLayers[regulatoryZoneName]}
                regulatoryZoneMetadata={regulatoryZoneMetadata}
                isLastItem={Object.keys(selectedRegulatoryLayers).length === index + 1}
                allowRemoveZone={true}
              />)
            })
            : <NoLayerSelected>Aucune zone sélectionnée</NoLayerSelected>
        }
      </RegulatoryLayersList>
    </>
  )
}

const NoLayerSelected = styled.div`
  color: ${COLORS.grayDarkerTwo};
  margin: 10px;
  font-size: 13px;
`

const RegulatoryLayersTitle = styled.div`
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

const RegulatoryLayersList = styled.ul`
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

export default RegulatoryLayers
