import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import RegulatoryLayerTopic from './RegulatoryLayerTopic'
import { COLORS } from '../../../constants/constants'
import removeRegulatoryZoneFromMySelection from '../../../domain/use_cases/removeRegulatoryZoneFromMySelection'
import LayersEnum, { layersType } from '../../../domain/entities/layers'
import hideLayer from '../../../domain/use_cases/hideLayer'
import { useDispatch, useSelector } from 'react-redux'
import layer from '../../../domain/shared_slices/Layer'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'

const RegulatoryLayers = props => {
  const dispatch = useDispatch()
  const {
    namespace,
    hideLayersListWhenSearching,
    regulatoryLayersAddedToMySelection
  } = props
  const { setLayersSideBarOpenedZone } = layer[namespace].actions

  const {
    selectedRegulatoryLayers
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
    dispatch(hideLayer({
      type: LayersEnum.REGULATORY.code,
      ...regulatoryZone,
      namespace
    }))
    dispatch(removeRegulatoryZoneFromMySelection(regulatoryZone))
  }

  useEffect(() => {
    if (firstUpdate) {
      firstUpdate.current = false
    } else {
      if (hideLayersListWhenSearching) {
        setShowRegulatoryLayers(false)
      } else {
        setShowRegulatoryLayers(true)
      }
    }
  }, [hideLayersListWhenSearching])

  const onTitleClicked = () => {
    if (showRegulatoryLayers) {
      dispatch(setLayersSideBarOpenedZone(''))
    } else {
      dispatch(setLayersSideBarOpenedZone(layersType.REGULATORY))
    }
  }

  return (
    <>
      <RegulatoryLayersTitle
        data-cy={'regulatory-layers-my-zones'}
        onClick={() => onTitleClicked()}
        regulatoryLayersAddedToMySelection={regulatoryLayersAddedToMySelection}
        showRegulatoryLayers={showRegulatoryLayers}
      >
        Mes zones réglementaires <ChevronIcon $isOpen={showRegulatoryLayers}/>
      </RegulatoryLayersTitle>
      <RegulatoryLayersList
        topicLength={Object.keys(selectedRegulatoryLayers).length}
        zoneLength={numberOfZonesOpened}
        showRegulatoryLayers={showRegulatoryLayers}
      >
        {
          selectedRegulatoryLayers && Object.keys(selectedRegulatoryLayers).length > 0
            ? Object.keys(selectedRegulatoryLayers).map((regulatoryTopic, index) => {
              return (<RegulatoryLayerTopic
                key={regulatoryTopic}
                increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
                decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
                callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryLayerFromMySelection}
                regulatoryTopic={regulatoryTopic}
                regulatoryZones={selectedRegulatoryLayers[regulatoryTopic]}
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
  border-bottom-left-radius: ${props => props.showRegulatoryLayers ? '0' : '2px'};
  border-bottom-right-radius: ${props => props.showRegulatoryLayers ? '0' : '2px'};
  background: ${COLORS.charcoal};
  
  animation: ${props => props.regulatoryLayersAddedToMySelection ? 'blink' : ''} 0.3s ease forwards;

  @keyframes blink {
    0%   {
        background: ${COLORS.lightGray};
    }
    20%   {
        background: ${COLORS.charcoal};
    }
    40% {
        background: ${COLORS.charcoal};
    }
    60%   {
        background: ${COLORS.lightGray};
    }
    80%   {
        background: ${COLORS.lightGray};
    }
    100% {
        background: ${COLORS.charcoal};
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
  height: ${props => props.showRegulatoryLayers
  ? props.topicLength || props.zoneLength
      ? 36 * props.topicLength + props.zoneLength * 39
      : 40
  : 0}px;
  transition: 0.5s all;
`

export default RegulatoryLayers
