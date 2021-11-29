import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import RegulatoryLayerZone from './RegulatoryLayerZone'
import { getHash } from '../../../utils'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../layers/styles/administrativeAndRegulatoryLayers.style'
import Layers, { getGearCategory } from '../../../domain/entities/layers'
import { COLORS } from '../../../constants/constants'
import { useSelector } from 'react-redux'
import NamespaceContext from '../../../domain/context/NamespaceContext'
import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../../commonStyles/icons/HideIcon.style'

const RegulatoryLayerTopic = props => {
  const {
    callRemoveRegulatoryZoneFromMySelection,
    regulatoryTopic,
    allowRemoveZone,
    increaseNumberOfZonesOpened,
    decreaseNumberOfZonesOpened,
    regulatoryZones,
    isLastItem,
    isEditable
  } = props

  const gears = useSelector(state => state.gear.gears)
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const {
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

  const [isOpen, setIsOpen] = useState(false)
  const [showWholeLayer, setShowWholeLayer] = useState(undefined)
  const [atLeastOneLayerIsShowed, setAtLeastOneLayerIsShowed] = useState(false)

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
    if (regulatoryZoneMetadata && regulatoryTopic && regulatoryZoneMetadata.topic === regulatoryTopic) {
      setIsOpen(true)
    }
  }, [regulatoryZoneMetadata, regulatoryTopic, setIsOpen])

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

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <Row
          data-cy="regulatory-layer-topic-row"
          isOpen={isOpen}>
          <Zone isLastItem={isLastItem} isOpen={isOpen}>
            <Name
              data-cy={'regulatory-layers-my-zones-topic'}
              title={regulatoryTopic.replace(/[_]/g, ' ')}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Text>
                {regulatoryTopic.replace(/[_]/g, ' ')}
              </Text>
            </Name>
            {displayNumberOfZones()}
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
  padding-left: 10px;
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

const List = styled.div`
  height: inherit;
  overflow: hidden;
  transition: all 0.5s;
  height: ${props => props.isOpen ? props.zonesLength * 37.5 : 0}px;
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

export default RegulatoryLayerTopic
