import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import RegulatoryLayerZone from './RegulatoryLayerZone'
import { getHash } from '../../../utils'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../layers/styles/administrativeAndRegulatoryLayers.style'
import Layers, { getGearCategory } from '../../../domain/entities/layers'
import { COLORS } from '../../../constants/constants'
import NamespaceContext from '../../../domain/context/NamespaceContext'
import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../../commonStyles/icons/HideIcon.style'
import { EditIcon } from '../../commonStyles/icons/EditIcon.style'
import LayerNameInput from '../../backoffice/LayerNameInput'
import { addRegulatoryTopicOpened, removeRegulatoryTopicOpened } from '../../../domain/shared_slices/Regulatory'

const RegulatoryLayerTopic = props => {
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

  const gears = useSelector(state => state.gear.gears)
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const {
    regulatoryZoneMetadata,
    regulatoryTopicsOpened
  } = useSelector(state => state.regulatory)

  const [isOpen, setIsOpen] = useState(false)
  const [showWholeLayer, setShowWholeLayer] = useState(undefined)
  const [atLeastOneLayerIsShowed, setAtLeastOneLayerIsShowed] = useState(false)
  const [isLayerNameEditable, setIsLayerNameEditable] = useState(false)

  useEffect(() => {
    if (regulatoryTopicsOpened[regulatoryTopicsOpened.length - 1] === regulatoryTopic) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
    }
  }, [])

  useEffect(() => {
    if (showedLayers && regulatoryTopic) {
      const topicFoundInShowedLayers = showedLayers
        .some(layer => layer.topic === regulatoryTopic)
      const topicFoundInSelectedLayers = regulatoryZones
        .some(layer => layer.topic === regulatoryTopic)

      setAtLeastOneLayerIsShowed(topicFoundInShowedLayers && topicFoundInSelectedLayers)
    }
  }, [showedLayers, regulatoryZones, regulatoryTopic])

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
    if (regulatoryTopic && ((regulatoryZoneMetadata && regulatoryZoneMetadata.topic === regulatoryTopic) ||
      (regulatoryTopicsOpened && regulatoryTopicsOpened.includes(regulatoryTopic)))) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [regulatoryZoneMetadata, regulatoryTopic, regulatoryTopicsOpened, setIsOpen])

  const getRegulatoryLayerName = regulatoryZones => {
    return {
      topic: regulatoryZones[0].topic
    }
  }

  const displayNumberOfZones = () => {
    const zoneNumber = regulatoryZones.length
    return (<ZonesNumber>
        {`${zoneNumber} zone${zoneNumber > 1 ? 's' : ''}`}
      </ZonesNumber>
    )
  }

  const showRegulatoryZones = namespace => {
    return regulatoryZones.map((regulatoryZone, index) => {
      let vectorLayerStyle
      if (regulatoryZone.zone && regulatoryZone.topic && gears) {
        const hash = getHash(`${regulatoryZone.topic}:${regulatoryZone.zone}`)
        const gearCategory = getGearCategory(regulatoryZone.gears, gears)
        vectorLayerStyle = getAdministrativeAndRegulatoryLayersStyle(Layers.REGULATORY.code)(null, hash, gearCategory)
      }

      return (
        <RegulatoryLayerZone
          isLast={regulatoryZones.length === index + 1}
          regulatoryZone={regulatoryZone}
          vectorLayerStyle={vectorLayerStyle}
          key={`${regulatoryZone.topic}:${regulatoryZone.zone}`}
          callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
          showWholeLayer={showWholeLayer}
          namespace={namespace}
          zoneIsShown={getZoneIsShown(regulatoryZone)}
          allowRemoveZone={allowRemoveZone}
          isEditable={isEditable}
          regulatoryTopic={regulatoryTopic}
        />
      )
    })
  }

  const getZoneIsShown = useCallback(zone => {
    return showedLayers
      .some(layer =>
        layer.topic === zone.topic &&
        layer.zone === zone.zone)
  }, [showedLayers])

  const [isOver, setIsOver] = useState(false)
  const onMouseOver = () => !isOver && setIsOver(true)
  const onMouseOut = () => isOver && setIsOver(false)

  const onEditLayerNameClick = () => {
    setIsLayerNameEditable(true)
  }

  const onRegulatoryTopicClick = useCallback(() => {
    if (isOpen) {
      dispatch(removeRegulatoryTopicOpened(regulatoryTopic))
    } else {
      dispatch(addRegulatoryTopicOpened(regulatoryTopic))
    }
  }, [isOpen, regulatoryTopic])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <Row
          ref={ref}
          data-cy="regulatory-layer-topic-row"
          isOpen={isOpen}>
          <Zone
            isLastItem={isLastItem}
            isOpen={isOpen}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          >
            <Name
              data-cy={'regulatory-layers-my-zones-topic'}
              title={regulatoryTopic.replace(/[_]/g, ' ')}
              onClick={onRegulatoryTopicClick}
            >
              {!isLayerNameEditable
                ? <Text>
                  {regulatoryTopic.replace(/[_]/g, ' ')}
                </Text>
                : <LayerNameInput
                  layerName={regulatoryTopic}
                  updateLayerName={updateLayerName}
                  setIsLayerNameEditable={setIsLayerNameEditable}
                />
              }
            </Name>
            {displayNumberOfZones()}
            {
              isEditable
                ? <EditIcon
                  data-cy="regulatory-layername-edit"
                  $isOver={isOver}
                  title="Modifier le nom de la thématique"
                  onClick={() => onEditLayerNameClick()}/>
                : null
            }
            {
              atLeastOneLayerIsShowed
                ? <ShowIcon
                  title="Cacher la couche"
                  onClick={() => setShowWholeLayer({ show: false })}
                />
                : <HideIcon
                  data-cy={'regulatory-layers-my-zones-topic-show'}
                  title="Afficher la couche"
                  onClick={() => setShowWholeLayer({ show: true })}
                />
            }
            {allowRemoveZone && <CloseIcon title="Supprimer la couche de ma sélection"
                                           onClick={() => callRemoveRegulatoryZoneFromMySelection(
                                             getRegulatoryLayerName(regulatoryZones), regulatoryZones.length)}/>}
          </Zone>
          <List
            isOpen={isOpen}
            name={regulatoryTopic.replace(/\s/g, '-')}
            zonesLength={regulatoryZones.length}
            >
            {regulatoryZones && showedLayers && showRegulatoryZones(namespace)}
          </List>
        </Row>
      )}
    </NamespaceContext.Consumer>
  )
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
  ${props => (!props.isOpen && props.isLastItem) ? null : `border-bottom: 1px solid ${COLORS.lightGray};`}
  
  :hover {
    background: ${COLORS.shadowBlueLittleOpacity};
  }
`

const List = styled.li`
  height: inherit;
  overflow-y: scroll;
  overflow-x: hidden;
  transition: all 0.5s;
  height: ${props => props.isOpen ? props.zonesLength * 37.5 : 0}px;
`

const Row = styled.div`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-y: scroll !important;
  overflow-y: hidden !important;
  cursor: pointer;import LayerNameInput from '../../backoffice/LayerNameInput'

  margin: 0;
  line-height: 1.9em;
  display: block;
`

export default RegulatoryLayerTopic
