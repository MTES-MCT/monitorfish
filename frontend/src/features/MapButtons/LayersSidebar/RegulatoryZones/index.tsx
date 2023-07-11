// TODO Remove temporary `any`/`as any` and `@ts-ignore` (fresh migration to TS).

import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { RegulatoryTopic } from './RegulatoryTopic'
import removeRegulatoryZoneFromMySelection from '../../../../domain/use_cases/layer/regulation/removeRegulatoryZoneFromMySelection'
import { LayerProperties, LayerType } from '../../../../domain/entities/layers/constants'
import hideLayer from '../../../../domain/use_cases/layer/hideLayer'
import layer from '../../../../domain/shared_slices/Layer'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
import { closeRegulatoryZoneMetadata } from '../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

export type RegulatoryZonesProps = {
  namespace: any
  hideLayersListWhenSearching?: boolean
  regulatoryLayersAddedToMySelection: any
}
export function RegulatoryZones({
  namespace,
  hideLayersListWhenSearching = false,
  regulatoryLayersAddedToMySelection
}: RegulatoryZonesProps) {
  const dispatch = useMainAppDispatch()
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions

  const { selectedRegulatoryLayers } = useMainAppSelector(state => state.regulatory)
  const advancedSearchIsOpen = useMainAppSelector(state => state.regulatoryLayerSearch.advancedSearchIsOpen)

  const { layersSidebarOpenedLayerType } = useMainAppSelector(state => state.layer)

  const [showRegulatoryLayers, setShowRegulatoryLayers] = useState(false)
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const firstUpdate = useRef(true)

  useEffect(() => {
    setShowRegulatoryLayers(layersSidebarOpenedLayerType === LayerType.REGULATORY)
  }, [layersSidebarOpenedLayerType, setShowRegulatoryLayers])

  const increaseNumberOfZonesOpened = useCallback(number => {
    setNumberOfZonesOpened(numberOfZonesOpened => numberOfZonesOpened + number)
  }, [])

  const decreaseNumberOfZonesOpened = useCallback(number => {
    setNumberOfZonesOpened(numberOfZonesOpened => numberOfZonesOpened - number)
  }, [])

  useEffect(() => {
    if (numberOfZonesOpened < 0) {
      setNumberOfZonesOpened(0)
    }
  }, [numberOfZonesOpened])

  const callRemoveRegulatoryLayerFromMySelection = useCallback(
    (regulatoryZone, numberOfZones, namespace) => {
      decreaseNumberOfZonesOpened(numberOfZones)
      dispatch(
        hideLayer({
          type: LayerProperties.REGULATORY.code,
          ...regulatoryZone,
          namespace
        })
      )
      dispatch(removeRegulatoryZoneFromMySelection(regulatoryZone))
    },
    [numberOfZonesOpened]
  )

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
        $regulatoryLayersAddedToMySelection={regulatoryLayersAddedToMySelection}
        $showRegulatoryLayers={showRegulatoryLayers}
      >
        Mes zones réglementaires <ChevronIcon $isOpen={showRegulatoryLayers} />
      </RegulatoryLayersTitle>
      {selectedRegulatoryLayers ? (
        <RegulatoryLayersList
          $advancedSearchIsOpen={advancedSearchIsOpen}
          className={'smooth-scroll'}
          $topicLength={Object.keys(selectedRegulatoryLayers).length}
          $zoneLength={numberOfZonesOpened}
          $showRegulatoryLayers={showRegulatoryLayers}
        >
          {selectedRegulatoryLayers && Object.keys(selectedRegulatoryLayers).length > 0 ? (
            Object.keys(selectedRegulatoryLayers).map((regulatoryTopic, index) => {
              return (
                <RegulatoryTopic
                  isEditable={false}
                  key={regulatoryTopic}
                  increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
                  decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
                  callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryLayerFromMySelection}
                  regulatoryTopic={regulatoryTopic}
                  regulatoryZones={selectedRegulatoryLayers[regulatoryTopic]}
                  isLastItem={Object.keys(selectedRegulatoryLayers).length === index + 1}
                  allowRemoveZone={true}
                />
              )
            })
          ) : (
            <NoLayerSelected>Aucune zone sélectionnée</NoLayerSelected>
          )}
        </RegulatoryLayersList>
      ) : null}
    </>
  )
}

const NoLayerSelected = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin: 10px;
  font-size: 13px;
`

const RegulatoryLayersTitle = styled.div<{
  $regulatoryLayersAddedToMySelection: boolean
  $showRegulatoryLayers: boolean
}>`
  height: 30px;
  padding-top: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${p => (p.$showRegulatoryLayers ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.$showRegulatoryLayers ? '0' : '2px')};
  background: ${p => p.theme.color.charcoal};

  animation: ${p => (p.$regulatoryLayersAddedToMySelection ? 'blink' : '')} 0.3s ease forwards;

  @keyframes blink {
    0% {
      background: ${p => p.theme.color.lightGray};
    }
    20% {
      background: ${p => p.theme.color.charcoal};
    }
    40% {
      background: ${p => p.theme.color.charcoal};
    }
    60% {
      background: ${p => p.theme.color.lightGray};
    }
    80% {
      background: ${p => p.theme.color.lightGray};
    }
    100% {
      background: ${p => p.theme.color.charcoal};
    }
  }

  color: ${p => p.theme.color.gainsboro};
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

const RegulatoryLayersList = styled.ul<{
  $advancedSearchIsOpen: boolean
  $showRegulatoryLayers: boolean
  $topicLength: number
  $zoneLength: number
}>`
  margin: 0;
  background-color: ${p => p.theme.color.white};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: ${p => (p.$advancedSearchIsOpen ? 'calc(70vh - 235px)' : '70vh')};
  overflow-x: hidden;
  color: ${p => p.theme.color.gunMetal};
  height: ${p =>
    p.$showRegulatoryLayers ? (p.$topicLength || p.$zoneLength ? 40 * p.$topicLength + p.$zoneLength * 36 : 40) : 0}px;
  transition: 0.5s all;
`
