// TODO Remove temporary `any`/`as any` (fresh migration to TS).

import { LayerProperties, LayerType } from '@features/Map/constants'
import { layerActions } from '@features/Map/layer.slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { RegulatoryTopic } from './RegulatoryTopic'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import { regulationActions } from '../../slice'
import { closeRegulatoryZoneMetadata } from '../../useCases/closeRegulatoryZoneMetadata'
import { hideRegulatoryZoneLayerById } from '../../useCases/hideRegulatoryZoneLayerById'

export function RegulatoryZones() {
  const dispatch = useMainAppDispatch()

  const selectedRegulatoryLayers = useMainAppSelector(state => state.regulation.selectedRegulatoryLayers)
  const advancedSearchIsOpen = useMainAppSelector(state => state.regulatoryLayerSearch.advancedSearchIsOpen)
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)
  const isOpen = layersSidebarOpenedLayerType === LayerType.REGULATORY

  const removeById = useCallback(
    (id: number | string) => {
      dispatch(hideRegulatoryZoneLayerById(id))
      dispatch(regulationActions.removeSelectedZoneById(id))
    },
    [dispatch]
  )

  const removeByTopic = useCallback(
    (topic: string) => {
      dispatch(
        hideLayer({
          topic,
          type: LayerProperties.REGULATORY.code
        })
      )
      dispatch(regulationActions.removeSelectedZonesByTopic(topic))
    },
    [dispatch]
  )

  const onTitleClicked = () => {
    if (isOpen) {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(LayerType.REGULATORY))
      dispatch(closeRegulatoryZoneMetadata())
    }
  }

  return (
    <>
      <RegulatoryLayersTitle $isOpen={isOpen} data-cy="regulatory-layers-my-zones" onClick={onTitleClicked}>
        <Pin /> Mes zones réglementaires <ChevronIcon $isOpen={isOpen} />
      </RegulatoryLayersTitle>
      {selectedRegulatoryLayers && isOpen && (
        <RegulatoryLayersList $advancedSearchIsOpen={advancedSearchIsOpen} className="smooth-scroll">
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
        </RegulatoryLayersList>
      )}
    </>
  )
}

const Pin = styled(Icon.Pin)`
  margin-right: 4px;
`

const NoLayerSelected = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin: 10px;
  font-size: 13px;
`

const RegulatoryLayersTitle = styled.div<{
  $isOpen: boolean
}>`
  background: ${p => p.theme.color.charcoal};
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom-left-radius: ${p => (p.$isOpen ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.$isOpen ? '0' : '2px')};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${p => p.theme.color.gainsboro};
  cursor: pointer;
  font-size: 16px;
  height: 30px;
  padding-left: 20px;
  padding-top: 5px;
  text-align: left;
  user-select: none;

  .Element-IconBox:last-child {
    float: right;
    margin-top: 4px;
  }

  .Element-IconBox:first-child {
    vertical-align: bottom;
  }
`

const RegulatoryLayersList = styled.ul<{
  $advancedSearchIsOpen: boolean
}>`
  background-color: ${p => p.theme.color.white};
  border-radius: 0 0 2px 2px;
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  max-height: ${p => (p.$advancedSearchIsOpen ? 'calc(70vh - 235px)' : '70vh')};
  overflow-x: hidden;
  padding: 0;
  transition: 0.5s all;
`
