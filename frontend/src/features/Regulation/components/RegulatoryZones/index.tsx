// TODO Remove temporary `any`/`as any` (fresh migration to TS).

import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { RegulatoryTopic } from './RegulatoryTopic'
import { LayerProperties, LayerType } from '../../../../domain/entities/layers/constants'
import layer from '../../../../domain/shared_slices/Layer'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../../libs/FrontendError'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import { regulatoryActions } from '../../slice'
import { closeRegulatoryZoneMetadata } from '../../useCases/closeRegulatoryZoneMetadata'
import { hideRegulatoryZoneLayerById } from '../../useCases/hideRegulatoryZoneLayerById'

import type { LayerSliceNamespace } from '../../../../domain/entities/layers/types'

export type RegulatoryZonesProps = {
  hideLayersListWhenSearching?: boolean
  namespace: LayerSliceNamespace
  regulatoryLayersAddedToMySelection: any
}
export function RegulatoryZones({
  hideLayersListWhenSearching = false,
  namespace,
  regulatoryLayersAddedToMySelection
}: RegulatoryZonesProps) {
  const dispatch = useMainAppDispatch()
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions

  const { selectedRegulatoryLayers } = useMainAppSelector(state => state.regulatory)
  const advancedSearchIsOpen = useMainAppSelector(state => state.regulatoryLayerSearch.advancedSearchIsOpen)

  const { layersSidebarOpenedLayerType } = useMainAppSelector(state => state.layer)

  const [isOpen, setIsOpen] = useState(false)
  const [showRegulatoryLayers, setShowRegulatoryLayers] = useState(false)
  const firstUpdate = useRef(true)

  useEffect(() => {
    setShowRegulatoryLayers(layersSidebarOpenedLayerType === LayerType.REGULATORY)
  }, [layersSidebarOpenedLayerType, setShowRegulatoryLayers])

  const removeById = useCallback(
    (id: number | string) => {
      dispatch(hideRegulatoryZoneLayerById(id, namespace))
      dispatch(regulatoryActions.removeSelectedZoneById(id))
    },
    [dispatch, namespace]
  )

  const removeByTopic = useCallback(
    (topic: string) => {
      dispatch(
        hideLayer({
          namespace,
          topic,
          type: LayerProperties.REGULATORY.code
        })
      )
      dispatch(regulatoryActions.removeSelectedZonesByTopic(topic))
    },
    [dispatch, namespace]
  )

  useEffect(() => {
    if (firstUpdate) {
      firstUpdate.current = false
    } else if (hideLayersListWhenSearching) {
      setShowRegulatoryLayers(false)
    } else {
      setShowRegulatoryLayers(true)
    }
  }, [hideLayersListWhenSearching])

  const onTitleClicked = () => {
    if (!setLayersSideBarOpenedLayerType) {
      throw new FrontendError('`setLayersSideBarOpenedLayerType` is undefined.')
    }

    setIsOpen(!isOpen)

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
        $regulatoryLayersAddedToMySelection={regulatoryLayersAddedToMySelection}
        $showRegulatoryLayers={showRegulatoryLayers}
        data-cy="regulatory-layers-my-zones"
        onClick={() => onTitleClicked()}
      >
        Mes zones réglementaires <ChevronIcon $isOpen={showRegulatoryLayers} />
      </RegulatoryLayersTitle>
      {selectedRegulatoryLayers && (
        <RegulatoryLayersList $advancedSearchIsOpen={advancedSearchIsOpen} className="smooth-scroll">
          {isOpen && (
            <>
              {Object.keys(selectedRegulatoryLayers).length > 0 ? (
                Object.keys(selectedRegulatoryLayers).map((regulatoryTopic, index) => (
                  <RegulatoryTopic
                    key={regulatoryTopic}
                    allowRemoveZone
                    isEditable={false}
                    isLastItem={Object.keys(selectedRegulatoryLayers).length === index + 1}
                    onRemoveById={removeById}
                    onRemoveByTopic={removeByTopic}
                    regulatoryTopic={regulatoryTopic}
                    regulatoryZones={selectedRegulatoryLayers[regulatoryTopic]}
                  />
                ))
              ) : (
                <NoLayerSelected>Aucune zone sélectionnée</NoLayerSelected>
              )}
            </>
          )}
        </RegulatoryLayersList>
      )}
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
}>`
  background-color: ${p => p.theme.color.white};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  max-height: ${p => (p.$advancedSearchIsOpen ? 'calc(70vh - 235px)' : '70vh')};
  overflow-x: hidden;
  padding: 0;
  transition: 0.5s all;
`
