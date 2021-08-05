import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import RegulatoryLayerZone from './RegulatoryLayerZone'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import { getHash } from '../../../utils'
import { getVectorLayerStyle } from '../../../layers/styles/vectorLayer.style'
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
    isLastItem
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
    return regulatoryZones.map(regulatoryZone => {
      let vectorLayerStyle
      if (regulatoryZone.zone && regulatoryZone.topic && regulatoryZone.gears && gears) {
        const hash = getHash(`${regulatoryZone.topic}:${regulatoryZone.zone}`)
        const gearCategory = getGearCategory(regulatoryZone.gears, gears)
        vectorLayerStyle = getVectorLayerStyle(Layers.REGULATORY.code)(null, hash, gearCategory)
      }

      return (
        <RegulatoryLayerZone
          regulatoryZone={regulatoryZone}
          vectorLayerStyle={vectorLayerStyle}
          key={`${regulatoryZone.topic}:${regulatoryZone.zone}`}
          callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
          showWholeLayer={showWholeLayer}
          namespace={namespace}
          zoneIsShown={getZoneIsShown(regulatoryZone)}
          allowRemoveZone={allowRemoveZone}
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
        <Row isOpen={isOpen}>
          <Zone isLastItem={isLastItem} isOpen={isOpen}>
            <Name
              data-cy={'regulatory-layers-my-zones-topic'}
              title={regulatoryTopic.replace(/[_]/g, ' ')}
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronIcon isOpen={isOpen}/>
              <Text>
                {regulatoryTopic.replace(/[_]/g, ' ')}
              </Text>
            </Name>
            {displayNumberOfZones()}
            {atLeastOneLayerIsShowed
              ? <ShowIcon title="Cacher la couche" onClick={() => setShowWholeLayer({ show: false })}/>
              : <HideIcon title="Afficher la couche" onClick={() => setShowWholeLayer({ show: true })}/>}
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
`

const List = styled.div`
  height: inherit;
  overflow: hidden;
  transition: all 0.5s;
  height: ${props => props.isOpen ? props.zonesLength * 38.5 : 0}px;
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
  border-bottom: rgba(255, 255, 255, 0.2) 1px solid;
  line-height: 1.9em;
  display: block;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: ${props => props.isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  width: 16px;
  margin-right: 5px;
  margin-top: 5px;
  transition: all 0.5s;
`

export default RegulatoryLayerTopic
