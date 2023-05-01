import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import RegulatoryLayerTopic from './RegulatoryTopic'
import { COLORS } from '../../../../constants/constants'
import removeRegulatoryZoneFromMySelection from '../../../../domain/use_cases/layer/regulation/removeRegulatoryZoneFromMySelection'
import { LayerProperties, LayerType } from '../../../../domain/entities/layers/constants'
import hideLayer from '../../../../domain/use_cases/layer/hideLayer'
import { useDispatch, useSelector } from 'react-redux'
import layer from '../../../../domain/shared_slices/Layer'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
import { closeRegulatoryZoneMetadata } from '../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'

const RegulatoryZones = props => {
  const dispatch = useDispatch()
  const {
    namespace,
    hideLayersListWhenSearching,
    regulatoryLayersAddedToMySelection
  } = props
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions

  const {
    selectedRegulatoryLayers
  } = useSelector(state => state.regulatory)
  const advancedSearchIsOpen = useSelector(state => state.regulatoryLayerSearch.advancedSearchIsOpen)

  const { layersSidebarOpenedLayerType } = useSelector(state => state.layer)

  const [showRegulatoryLayers, setShowRegulatoryLayers] = useState(false)
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const firstUpdate = useRef(true)

  useEffect(() => {
    setShowRegulatoryLayers(layersSidebarOpenedLayerType === LayerType.REGULATORY)
  }, [layersSidebarOpenedLayerType, setShowRegulatoryLayers])

  const increaseNumberOfZonesOpened = useCallback(number => {
    setNumberOfZonesOpened((numberOfZonesOpened) => numberOfZonesOpened + number)
  }, [])

  const decreaseNumberOfZonesOpened = useCallback(number => {
    setNumberOfZonesOpened((numberOfZonesOpened) => numberOfZonesOpened - number)
  }, [])

  useEffect(() => {
    if (numberOfZonesOpened < 0) {
      setNumberOfZonesOpened(0)
    }
  }, [numberOfZonesOpened])

  const callRemoveRegulatoryLayerFromMySelection = useCallback((regulatoryZone, numberOfZones, namespace) => {
    decreaseNumberOfZonesOpened(numberOfZones)
    dispatch(hideLayer({
      type: LayerProperties.REGULATORY.code,
      ...regulatoryZone,
      namespace
    }))
    dispatch(removeRegulatoryZoneFromMySelection(regulatoryZone))
  }, [numberOfZonesOpened])

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
      dispatch(setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(setLayersSideBarOpenedLayerType(LayerType.REGULATORY))
      dispatch(closeRegulatoryZoneMetadata())
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
      {selectedRegulatoryLayers
        ? <RegulatoryLayersList
          advancedSearchIsOpen={advancedSearchIsOpen}
          className={'smooth-scroll'}
          topicLength={Object.keys(selectedRegulatoryLayers).length}
          zoneLength={numberOfZonesOpened}
          showRegulatoryLayers={showRegulatoryLayers}
        >
          {
            selectedRegulatoryLayers && Object.keys(selectedRegulatoryLayers).length > 0
              ? Object.keys(selectedRegulatoryLayers).map((regulatoryTopic, index) => {
                return (<RegulatoryLayerTopic
                  isEditable={false}
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
        : null}
    </>
  )
}

const NoLayerSelected = styled.div`
  color: ${p => p.theme.color.slateGray};
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

  > div {
   float: right;
   margin-top: 4px;
  }
`

const RegulatoryLayersList = styled.ul`
  margin: 0;
  background-color: ${COLORS.white};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: ${p => p.advancedSearchIsOpen ? 'calc(70vh - 235px)' : '70vh'};
  overflow-x: hidden;
  color: ${COLORS.gunMetal};
  height: ${props => props.showRegulatoryLayers
  ? props.topicLength || props.zoneLength
      ? 40 * props.topicLength + props.zoneLength * 36
      : 40
  : 0}px;
  transition: 0.5s all;
`

export default RegulatoryZones
