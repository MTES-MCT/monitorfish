// TODO Remove temporary `any`/`as any` and `@ts-ignore` (fresh migration to TS).

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { RegulatoryZone } from './RegulatoryZone'
import { COLORS } from '../../../../constants/constants'
import { NamespaceContext } from '../../../../context/NamespaceContext'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import {
  addRegulatoryTopicOpened,
  closeRegulatoryZoneMetadataPanel,
  removeRegulatoryTopicOpened
} from '../../../../domain/shared_slices/Regulatory'
import hideLayer from '../../../../domain/use_cases/layer/hideLayer'
import { showRegulatoryTopic } from '../../../../domain/use_cases/layer/regulation/showRegulatoryTopic'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import RegulatoryTopicInput from '../../../Backoffice/list_regulation/RegulatoryTopicInput'
import { CloseIcon } from '../../../commonStyles/icons/CloseIcon.style'
import { EditIcon } from '../../../commonStyles/icons/EditIcon.style'
import { HideIcon } from '../../../commonStyles/icons/HideIcon.style'
import { ShowIcon } from '../../../commonStyles/icons/ShowIcon.style'

import type { Promisable } from 'type-fest'

export type RegulatoryTopicProps = {
  allowRemoveZone: any
  callRemoveRegulatoryZoneFromMySelection: any
  decreaseNumberOfZonesOpened: any
  increaseNumberOfZonesOpened: any
  isEditable: any
  isLastItem: any
  regulatoryTopic: string
  regulatoryZones: any
  updateLayerName?: (topic: string, value: string) => Promisable<void>
}
function UnmemoizedRegulatoryTopic({
  allowRemoveZone,
  callRemoveRegulatoryZoneFromMySelection,
  decreaseNumberOfZonesOpened,
  increaseNumberOfZonesOpened,
  isEditable,
  isLastItem,
  regulatoryTopic,
  regulatoryZones,
  updateLayerName
}: RegulatoryTopicProps) {
  const dispatch = useMainAppDispatch()
  const ref = useRef<HTMLLIElement | null>(null)
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)
  const { regulatoryTopicsOpened, regulatoryZoneMetadata } = useMainAppSelector(state => state.regulatory)
  const lawType = regulatoryZones[0]?.lawType
  const numberOfTotalZones = useMainAppSelector(state => {
    const { regulatoryLayerLawTypes } = state.regulatory
    if (regulatoryLayerLawTypes && lawType && regulatoryTopic && regulatoryLayerLawTypes[lawType]) {
      const regulatoryLayerLawType = regulatoryLayerLawTypes[lawType]
      if (!regulatoryLayerLawType) {
        return 0
      }

      return regulatoryLayerLawType[regulatoryTopic]?.length || 0
    }

    return 0
  })

  const [isOpen, setIsOpen] = useState(false)
  const [atLeastOneTopicIsShowed, setAtLeastOneTopicIsShowed] = useState(false)
  const [isTopicInEdition, setIsTopicInEdition] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const onMouseEnter = () => !isOver && setIsOver(true)
  const onMouseLeave = () => isOver && setIsOver(false)

  useLayoutEffect(() => {
    if (ref.current && regulatoryTopicsOpened[regulatoryTopicsOpened.length - 1] === regulatoryTopic) {
      ref.current.scrollIntoView({ block: 'start', inline: 'nearest' })
    }
  }, [regulatoryTopic, regulatoryTopicsOpened])

  useEffect(() => {
    if (showedLayers && regulatoryTopic) {
      const topicFoundInShowedLayers = showedLayers.some(layer => layer.topic === regulatoryTopic)
      const topicFoundInSelectedLayers = regulatoryZones.some(layer => layer.topic === regulatoryTopic)

      setAtLeastOneTopicIsShowed(topicFoundInShowedLayers && topicFoundInSelectedLayers)
    }
  }, [showedLayers, regulatoryZones, regulatoryTopic])

  const showTopic = namespace => {
    dispatch(
      showRegulatoryTopic({
        namespace,
        regulatoryZones,
        type: LayerProperties.REGULATORY.code
      })
    )
  }

  const hideTopic = namespace => {
    dispatch(
      hideLayer({
        namespace,
        topic: regulatoryTopic,
        type: LayerProperties.REGULATORY.code
      })
    )
  }

  useEffect(() => {
    if (increaseNumberOfZonesOpened && decreaseNumberOfZonesOpened) {
      if (isOpen) {
        increaseNumberOfZonesOpened(regulatoryZones.length)
      } else {
        decreaseNumberOfZonesOpened(regulatoryZones.length)
      }
    }
  }, [decreaseNumberOfZonesOpened, increaseNumberOfZonesOpened, isOpen, regulatoryZones])

  useEffect(() => {
    if (
      regulatoryTopic &&
      ((regulatoryZoneMetadata && regulatoryZoneMetadata.topic === regulatoryTopic) ||
        (regulatoryTopicsOpened && regulatoryTopicsOpened.includes(regulatoryTopic)))
    ) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [regulatoryZoneMetadata, regulatoryTopic, regulatoryTopicsOpened, setIsOpen])

  const onEditTopicClick = () => {
    setIsTopicInEdition(true)
  }

  const onRegulatoryTopicClick = useCallback(() => {
    if (isOpen) {
      dispatch(removeRegulatoryTopicOpened(regulatoryTopic))
      dispatch(closeRegulatoryZoneMetadataPanel())
    } else {
      dispatch(addRegulatoryTopicOpened(regulatoryTopic))
    }
  }, [dispatch, isOpen, regulatoryTopic])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <Row ref={ref} data-cy="regulatory-layer-topic-row">
          <Zone $isLastItem={isLastItem} $isOpen={isOpen} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <Name data-cy="regulatory-layers-my-zones-topic" onClick={onRegulatoryTopicClick} title={regulatoryTopic}>
              {isTopicInEdition ? (
                <RegulatoryTopicInput
                  setIsTopicEditable={setIsTopicInEdition}
                  topic={regulatoryTopic}
                  updateTopic={updateLayerName}
                />
              ) : (
                <Text>{regulatoryTopic}</Text>
              )}
            </Name>
            <ZonesNumber>{`${regulatoryZones?.length}/${numberOfTotalZones}`}</ZonesNumber>
            {isEditable ? (
              <EditIcon
                $isOver={isOver}
                data-cy="regulatory-topic-edit"
                onClick={onEditTopicClick}
                title="Modifier le nom de la thématique"
              />
            ) : null}
            {atLeastOneTopicIsShowed ? (
              <ShowIcon
                // TODO Use an `<IconButton />`.
                // @ts-ignore
                onClick={() => hideTopic(namespace)}
                title="Cacher la couche"
              />
            ) : (
              <HideIcon
                data-cy="regulatory-layers-my-zones-topic-show"
                // TODO Use an `<IconButton />`.
                // @ts-ignore
                onClick={() => showTopic(namespace)}
                title="Afficher la couche"
              />
            )}
            {allowRemoveZone ? (
              <CloseIcon
                onClick={() =>
                  callRemoveRegulatoryZoneFromMySelection(
                    getRegulatoryLayerName(regulatoryZones),
                    regulatoryZones.length,
                    namespace
                  )
                }
                title="Supprimer la couche de ma sélection"
              />
            ) : null}
          </Zone>
          <List $isOpen={isOpen} $zonesLength={regulatoryZones.length}>
            {regulatoryZones && showedLayers
              ? regulatoryZones.map((regulatoryZone, index) => (
                  <RegulatoryZone
                    key={`${regulatoryZone.topic}:${regulatoryZone.zone}`}
                    allowRemoveZone={allowRemoveZone}
                    callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryZoneFromMySelection}
                    isEditable={isEditable}
                    isLast={regulatoryZones.length === index + 1}
                    namespace={namespace}
                    regulatoryTopic={regulatoryTopic}
                    regulatoryZone={regulatoryZone}
                  />
                ))
              : null}
          </List>
        </Row>
      )}
    </NamespaceContext.Consumer>
  )
}

const getRegulatoryLayerName = regulatoryZones => ({
  topic: regulatoryZones[0].topic
})

const Text = styled.span`
  margin-left: 5px;
`

const Name = styled.span`
  line-height: 2.7em;
  font-size: 13px;
  padding: 2px 10px;
  width: 79%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
`

const ZonesNumber = styled.span`
  font-size: 11px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
`

const Zone = styled.span<{
  $isLastItem: boolean
  $isOpen: boolean
}>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  font-weight: 500;
  ${p => (!p.$isOpen && p.$isLastItem ? null : `border-bottom: 1px solid ${p.theme.color.lightGray};`)}

  :hover {
    background: ${p => p.theme.color.blueGray['25']};
  }
`

const List = styled.div<{
  $isOpen: boolean
  $zonesLength: number
}>`
  height: inherit;
  overflow: hidden;
  transition: all 0.5s;
  height: ${p => (p.$isOpen ? p.$zonesLength * 36 : 0)}px;
`

const Row = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;

  margin: 0;
  line-height: 1.9em;
  display: block;
`

export const RegulatoryTopic = memo(UnmemoizedRegulatoryTopic)
