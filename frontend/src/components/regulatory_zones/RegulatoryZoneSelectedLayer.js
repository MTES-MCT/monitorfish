import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import RegulatoryZoneSelectedZone from './RegulatoryZoneSelectedZone'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { getHash } from '../../utils'
import { getGearCategory } from '../../domain/use_cases/showLayer'
import { getVectorLayerStyle } from '../../layers/styles/vectorLayers.style'
import Layers from '../../domain/entities/layers'
import { ReactComponent as CloseIconSVG } from '../icons/Croix_grise.svg'
import { COLORS } from '../../constants/constants'
import { ReactComponent as ShowIconSVG } from '../icons/oeil_affiche.svg'
import { ReactComponent as HideIconSVG } from '../icons/oeil_masque.svg'
import { useSelector } from 'react-redux'
import NamespaceContext from '../../domain/context/NamespaceContext'

const RegulatoryZoneSelectedLayer = props => {
  const gears = useSelector(state => state.gear.gears)
  const showedLayers = useSelector(state => state.layer.showedLayers)

  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [showWholeLayer, setShowWholeLayer] = useState(undefined)
  const [atLeastOneLayerIsShowed, setAtLeastOneLayerIsShowed] = useState(false)

  const {
    callRemoveRegulatoryZoneFromMySelection,
    isReadyToShowRegulatoryZones,
    regulatoryZoneName,
    allowRemoveZone,
    increaseNumberOfZonesOpened,
    decreaseNumberOfZonesOpened,
    regulatorySubZones,
    regulatoryZoneMetadata,
    isLastItem
  } = props

  useEffect(() => {
    if (showedLayers && regulatoryZoneName) {
      const showLayer = showedLayers
        .filter(layer => layer.type === Layers.REGULATORY.code)
        .some(layer => layer.zone.layerName === regulatoryZoneName)
      setAtLeastOneLayerIsShowed(showLayer)
    }
  }, [showedLayers])

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    if (increaseNumberOfZonesOpened && decreaseNumberOfZonesOpened) {
      if (isOpen) {
        increaseNumberOfZonesOpened(regulatorySubZones.length)
      } else {
        decreaseNumberOfZonesOpened(regulatorySubZones.length)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (regulatoryZoneMetadata && regulatoryZoneName && regulatoryZoneMetadata.layerName === regulatoryZoneName) {
      setIsOpen(true)
    }
  }, [regulatoryZoneMetadata, regulatoryZoneName, setIsOpen])

  const getRegulatoryLayerName = regulatorySubZones => {
    return {
      layerName: regulatorySubZones[0].layerName
    }
  }

  const displayNumberOfZones = () => {
    const zoneNumber = regulatorySubZones.length
    return (<ZoneNumber>
        {`${zoneNumber} zone${zoneNumber > 1 ? 's' : ''}`}
      </ZoneNumber>
    )
  }

  const showRegulatoryZonesSelected = namespace => {
    return regulatorySubZones.map(subZone => {
      let vectorLayerStyle
      if (subZone.zone && subZone.layerName && subZone.gears && gears) {
        const hash = getHash(`${subZone.layerName}:${subZone.zone}`)
        const gearCategory = getGearCategory(subZone.gears, gears)
        vectorLayerStyle = getVectorLayerStyle(Layers.REGULATORY.code)(null, hash, gearCategory)
      }

      return (
        <RegulatoryZoneSelectedZone
          subZone={subZone}
          vectorLayerStyle={vectorLayerStyle}
          key={`${subZone.layerName}:${subZone.zone}`}
          isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
          callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
          regulatoryZoneMetadata={props.regulatoryZoneMetadata}
          showWholeLayer={showWholeLayer}
          namespace={namespace}
          zoneIsShown={getZoneIsShown(subZone)}
          allowRemoveZone={allowRemoveZone}
        />
      )
    })
  }
  const getZoneIsShown = useCallback(subZone => {
    return showedLayers
      .filter(layer => layer.type === Layers.REGULATORY.code)
      .some(layer =>
        layer.zone.layerName === subZone.layerName &&
        layer.zone.zone === subZone.zone)
  }, [showedLayers])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <Row>
          <Zone isLastItem={isLastItem} isOpen={isOpen}>
            <Text title={regulatoryZoneName.replace(/[_]/g, ' ')} onClick={() => setIsOpen(!isOpen)}>
              <ChevronIcon firstUpdate={firstUpdate} isOpen={isOpen}/>
              {regulatoryZoneName.replace(/[_]/g, ' ')}
            </Text>
            {displayNumberOfZones()}
            {atLeastOneLayerIsShowed
              ? <ShowIcon title="Cacher la couche" onClick={() => setShowWholeLayer({ show: false })}/>
              : <HideIcon title="Afficher la couche" onClick={() => setShowWholeLayer({ show: true })}/>}
            {allowRemoveZone && <CloseIcon title="Supprimer la couche de ma sélection"
                                           onClick={() => callRemoveRegulatoryZoneFromMySelection(getRegulatoryLayerName(regulatorySubZones), regulatorySubZones.length)}/>}
          </Zone>
          <List
            isOpen={isOpen}
            name={regulatoryZoneName.replace(/\s/g, '-')}
            length={regulatorySubZones.length}
            firstUpdate={firstUpdate}>
            {regulatorySubZones && showedLayers && showRegulatoryZonesSelected(namespace)}
          </List>
        </Row>
      )}
    </NamespaceContext.Consumer>
  )
}

const Text = styled.span`
  line-height: 2.7em;
  font-size: 13px;
  padding-left: 10px;
  width: 79%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
`

const ZoneNumber = styled.span`
  font-size: 11px;
  color: ${COLORS.textGray};
  margin-right: 12px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 16px;
  margin: 2px 6px 0 0;
`

const baseIcon = css`
  flex: 0 0 24px;
  align-self: center;
`

const ShowIcon = styled(ShowIconSVG)`
  ${baseIcon}
`

const HideIcon = styled(HideIconSVG)`
  ${baseIcon}
`

const Zone = styled.span`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  ${props => (!props.isOpen && props.isLastItem) ? null : `border-bottom: 1px solid ${COLORS.gray};`}
`

const List = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  height: inherit;
  overflow: hidden;
  transition: all 0.5s;
  height: ${props => props.isOpen ? props.length * 38.5 : '0px'};
`

const Row = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 0.8em;
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
  border-bottom: 1px solid ${COLORS.squareBorder};
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: ${props => props.isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  width: 16px;
  margin-right: 5px;
  margin-top: 5px;
  transition: ${props => props.firstUpdate ? 'none' : 'all 0.5s'};
`

export default RegulatoryZoneSelectedLayer
