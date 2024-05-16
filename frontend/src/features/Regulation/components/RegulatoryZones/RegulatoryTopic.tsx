import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { RegulatoryZone } from './RegulatoryZone'
import { COLORS } from '../../../../constants/constants'
import { NamespaceContext } from '../../../../context/NamespaceContext'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../../libs/FrontendError'
import RegulatoryTopicInput from '../../../Backoffice/list_regulation/RegulatoryTopicInput'
import { EditIcon } from '../../../commonStyles/icons/EditIcon.style'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import { addRegulatoryTopicOpened, closeRegulatoryZoneMetadataPanel, removeRegulatoryTopicOpened } from '../../slice'
import { showRegulatoryTopic } from '../../useCases/showRegulatoryTopic'

import type { LayerSliceNamespace } from '../../../../domain/entities/layers/types'
import type { RegulatoryZone as RegulatoryZoneType } from '../../types'
import type { Promisable } from 'type-fest'

export type RegulatoryTopicProps = {
  allowRemoveZone: boolean
  isEditable: boolean
  isLastItem: boolean
  /** Remove a single regulation zone layer. */
  onRemoveById: (id: number | string) => Promisable<void>
  /** Remove all the regulation zone layers for the given topic. */
  onRemoveByTopic: (topic: string, numberOfZones: number) => Promisable<void>
  regulatoryTopic: string
  regulatoryZones: RegulatoryZoneType[] | undefined
  updateLayerName?: (topic: string, value: string) => Promisable<void>
}
function UnmemoizedRegulatoryTopic({
  allowRemoveZone,
  isEditable,
  isLastItem,
  onRemoveById,
  onRemoveByTopic,
  regulatoryTopic,
  regulatoryZones,
  updateLayerName
}: RegulatoryTopicProps) {
  if (!regulatoryZones) {
    throw new FrontendError('`regulatoryZones` is undefined.')
  }

  const dispatch = useMainAppDispatch()
  const ref = useRef<HTMLLIElement | null>(null)
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)
  const regulatoryTopicsOpened = useMainAppSelector(state => state.regulatory.regulatoryTopicsOpened)
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulatory.regulatoryZoneMetadata)
  const lawType = regulatoryZones[0]?.lawType
  const numberOfTotalZones = useMainAppSelector(state => {
    const { regulatoryLayerLawTypes } = state.regulatory

    if (regulatoryLayerLawTypes && lawType && regulatoryTopic && regulatoryLayerLawTypes[lawType]) {
      const regulatoryLayerLawType = regulatoryLayerLawTypes[lawType]
      if (!regulatoryLayerLawType) {
        return 0
      }

      return regulatoryLayerLawType[regulatoryTopic]?.length ?? 0
    }

    return 0
  })

  const [isOpen, setIsOpen] = useState(false)
  const [isTopicInEdition, setIsTopicInEdition] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const onMouseEnter = () => !isOver && setIsOver(true)
  const onMouseLeave = () => isOver && setIsOver(false)

  useLayoutEffect(() => {
    if (ref.current && regulatoryTopicsOpened[regulatoryTopicsOpened.length - 1] === regulatoryTopic) {
      ref.current.scrollIntoView(false)
    }
  }, [regulatoryTopic, regulatoryTopicsOpened])

  const atLeastOneZoneIsShowed = useMemo(() => {
    if (!showedLayers || !regulatoryTopic) {
      return false
    }

    const isTopicFoundInShowedLayers = showedLayers.some(layer => layer.topic === regulatoryTopic)
    const isTopicFoundInSelectedLayers = regulatoryZones.some(layer => layer.topic === regulatoryTopic)

    return isTopicFoundInShowedLayers && isTopicFoundInSelectedLayers
  }, [showedLayers, regulatoryZones, regulatoryTopic])

  const showTopic = (namespace: LayerSliceNamespace) => {
    dispatch(
      showRegulatoryTopic({
        namespace,
        regulatoryZones,
        type: LayerProperties.REGULATORY.code
      })
    )
  }

  const hideTopic = (namespace: LayerSliceNamespace) => {
    dispatch(
      hideLayer({
        namespace,
        topic: regulatoryTopic,
        type: LayerProperties.REGULATORY.code
      })
    )
  }

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
          <Topic $isLastItem={isLastItem} $isOpen={isOpen} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
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
            <Icons>
              {isEditable && (
                <EditIcon
                  $isOver={isOver}
                  data-cy="regulatory-topic-edit"
                  onClick={onEditTopicClick}
                  title="Modifier le nom de la thématique"
                />
              )}
              {atLeastOneZoneIsShowed ? (
                <Icon.Display
                  data-cy="regulatory-layers-my-zones-zone-hide"
                  /* eslint-disable-next-line react/jsx-no-bind */
                  onClick={() => hideTopic(namespace)}
                  size={20}
                  title={`Cacher la thématique "${regulatoryTopic}"`}
                />
              ) : (
                <Icon.Hide
                  color={THEME.color.lightGray}
                  data-cy="regulatory-layers-my-zones-zone-show"
                  /* eslint-disable-next-line react/jsx-no-bind */
                  onClick={() => showTopic(namespace)}
                  size={20}
                  title={`Afficher la thématique "${regulatoryTopic}"`}
                />
              )}
              {allowRemoveZone && (
                <Icon.Close
                  color={THEME.color.slateGray}
                  onClick={() => onRemoveByTopic(getFirstRegulatoryZoneTopic(regulatoryZones), regulatoryZones.length)}
                  size={15}
                  title="Supprimer la thématique de ma sélection"
                />
              )}
            </Icons>
          </Topic>
          <List $isOpen={isOpen} $zonesLength={regulatoryZones.length}>
            {regulatoryZones &&
              showedLayers &&
              regulatoryZones.map((regulatoryZone, index) => (
                <RegulatoryZone
                  key={`${regulatoryZone.topic}:${regulatoryZone.zone}`}
                  allowRemoveZone={allowRemoveZone}
                  isEditable={isEditable}
                  isLast={regulatoryZones.length === index + 1}
                  namespace={namespace}
                  onRemove={onRemoveById}
                  regulatoryTopic={regulatoryTopic}
                  regulatoryZone={regulatoryZone}
                />
              ))}
          </List>
        </Row>
      )}
    </NamespaceContext.Consumer>
  )
}

const Icons = styled.div`
  margin-left: auto;
  margin-right: 0px;
  flex-shrink: 0;
  display: flex;
  height: 36px;
  align-items: center;
  cursor: pointer;

  .Element-IconBox {
    left: auto;
    padding-left: 8px;
  }
`

const getFirstRegulatoryZoneTopic = (regulatoryZones: RegulatoryZoneType[]): string => {
  const firstRefulatoryZone = regulatoryZones[0]
  if (!firstRefulatoryZone) {
    throw new FrontendError('`firstRegulatoryZone` is undefined.')
  }

  return firstRefulatoryZone.topic
}

const Text = styled.span`
  margin-left: 5px;
`

const Name = styled.span`
  display: inline-block;
  font-size: 13px;
  line-height: 2.7em;
  overflow: hidden;
  padding: 2px 10px;
  text-overflow: ellipsis;
  width: 79%;
`

const ZonesNumber = styled.span`
  color: ${COLORS.slateGray};
  font-size: 11px;
  margin-right: 4px;
`

const Topic = styled.span<{
  $isLastItem: boolean
  $isOpen: boolean
}>`
  align-items: center;
  border-bottom: 1px solid ${p => (!p.$isOpen && p.$isLastItem ? p.theme.color.white : p.theme.color.lightGray)};
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  user-select: none;
  padding-right: 10px;

  :hover {
    background: ${p => p.theme.color.blueGray25};
  }
`

const List = styled.div<{
  $isOpen: boolean
  $zonesLength: number
}>`
  height: ${p => (p.$isOpen ? p.$zonesLength * 36 : 0)}px;
  overflow: hidden;
  transition: all 0.5s;
`

const Row = styled.li`
  cursor: pointer;
  display: block;
  font-size: 13px;
  line-height: 1.9em;
  list-style-type: none;
  margin: 0;
  overflow: hidden !important;
  padding: 0px 5px 0px 0px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`

export const RegulatoryTopic = memo(UnmemoizedRegulatoryTopic)
