import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import RegulatoryLayerZone from './RegulatoryZone'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { COLORS } from '../../../../constants/constants'
import { NamespaceContext } from '../../../../context/NamespaceContext'
import { CloseIcon } from '../../../commonStyles/icons/CloseIcon.style'
import { ShowIcon } from '../../../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../../../commonStyles/icons/HideIcon.style'
import { EditIcon } from '../../../commonStyles/icons/EditIcon.style'
import RegulatoryTopicInput from '../../../Backoffice/list_regulation/RegulatoryTopicInput'
import {
  addRegulatoryTopicOpened,
  closeRegulatoryZoneMetadataPanel,
  removeRegulatoryTopicOpened
} from '../../../../domain/shared_slices/Regulatory'
import { showRegulatoryTopic } from '../../../../domain/use_cases/layer/regulation/showRegulatoryTopic'
import hideLayer from '../../../../domain/use_cases/layer/hideLayer'
import { theme } from '../../../../ui/theme'

const RegulatoryTopic = props => {
  const {
    callRemoveRegulatoryZoneFromMySelection,
    regulatoryTopic,
    allowRemoveZone,
    increaseNumberOfZonesOpened,
    decreaseNumberOfZonesOpened,
    regulatoryZones,
    isLastItem,
    isEditable,
    updateLayerName
  } = props

  const dispatch = useDispatch()
  const ref = useRef()
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const { regulatoryZoneMetadata, regulatoryTopicsOpened } = useSelector(state => state.regulatory)
  const lawType = regulatoryZones[0]?.lawType
  const numberOfTotalZones = useSelector(state => {
    const regulatoryLayerLawTypes = state.regulatory.regulatoryLayerLawTypes
    if (regulatoryLayerLawTypes && lawType && regulatoryTopic) {
      return regulatoryLayerLawTypes[lawType][regulatoryTopic]?.length
    }
  })

  const [isOpen, setIsOpen] = useState(false)
  const [atLeastOneTopicIsShowed, setAtLeastOneTopicIsShowed] = useState(false)
  const [isTopicInEdition, setIsTopicInEdition] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const onMouseEnter = () => !isOver && setIsOver(true)
  const onMouseLeave = () => isOver && setIsOver(false)

  useLayoutEffect(() => {
    if (regulatoryTopicsOpened[regulatoryTopicsOpened.length - 1] === regulatoryTopic) {
      ref.current.scrollIntoView({ block: 'start', inline: 'nearest' })
    }
  }, [])

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
        type: LayerProperties.REGULATORY.code,
        regulatoryZones,
        namespace
      })
    )
  }

  const hideTopic = namespace => {
    dispatch(
      hideLayer({
        type: LayerProperties.REGULATORY.code,
        topic: regulatoryTopic,
        namespace
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
  }, [isOpen])

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
      batch(() => {
        dispatch(removeRegulatoryTopicOpened(regulatoryTopic))
        dispatch(closeRegulatoryZoneMetadataPanel())
      })
    } else {
      dispatch(addRegulatoryTopicOpened(regulatoryTopic))
    }
  }, [isOpen, regulatoryTopic])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <Row ref={ref} data-cy="regulatory-layer-topic-row" isOpen={isOpen}>
          <Zone isLastItem={isLastItem} isOpen={isOpen} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <Name data-cy={'regulatory-layers-my-zones-topic'} title={regulatoryTopic} onClick={onRegulatoryTopicClick}>
              {isTopicInEdition ? (
                <RegulatoryTopicInput
                  topic={regulatoryTopic}
                  updateTopic={updateLayerName}
                  setIsTopicEditable={setIsTopicInEdition}
                />
              ) : (
                <Text>{regulatoryTopic}</Text>
              )}
            </Name>
            <ZonesNumber>{`${regulatoryZones?.length}/${numberOfTotalZones}`}</ZonesNumber>
            {isEditable ? (
              <EditIcon
                data-cy="regulatory-topic-edit"
                $isOver={isOver}
                title="Modifier le nom de la thématique"
                onClick={onEditTopicClick}
              />
            ) : null}
            {atLeastOneTopicIsShowed ? (
              <ShowIcon title="Cacher la couche" onClick={() => hideTopic(namespace)} />
            ) : (
              <HideIcon
                data-cy={'regulatory-layers-my-zones-topic-show'}
                title="Afficher la couche"
                onClick={() => showTopic(namespace)}
              />
            )}
            {allowRemoveZone ? (
              <CloseIcon
                title="Supprimer la couche de ma sélection"
                onClick={() =>
                  callRemoveRegulatoryZoneFromMySelection(
                    getRegulatoryLayerName(regulatoryZones),
                    regulatoryZones.length,
                    namespace
                  )
                }
              />
            ) : null}
          </Zone>
          <List isOpen={isOpen} name={regulatoryTopic.replace(/\s/g, '-')} zonesLength={regulatoryZones.length}>
            {regulatoryZones && showedLayers
              ? regulatoryZones.map((regulatoryZone, index) => {
                  return (
                    <RegulatoryLayerZone
                      isLast={regulatoryZones.length === index + 1}
                      regulatoryZone={regulatoryZone}
                      key={`${regulatoryZone.topic}:${regulatoryZone.zone}`}
                      callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
                      namespace={namespace}
                      allowRemoveZone={allowRemoveZone}
                      isEditable={isEditable}
                      regulatoryTopic={regulatoryTopic}
                    />
                  )
                })
              : null}
          </List>
        </Row>
      )}
    </NamespaceContext.Consumer>
  )
}

const getRegulatoryLayerName = regulatoryZones => {
  return {
    topic: regulatoryZones[0].topic
  }
}

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

const Zone = styled.span`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  font-weight: 500;
  ${props => (!props.isOpen && props.isLastItem ? null : `border-bottom: 1px solid ${COLORS.lightGray};`)}

  :hover {
    background: ${theme.color.blueGray['25']};
  }
`

const List = styled.div`
  height: inherit;
  overflow: hidden;
  transition: all 0.5s;
  height: ${props => (props.isOpen ? props.zonesLength * 36 : 0)}px;
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

export default React.memo(RegulatoryTopic)
