import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import RegulatoryZoneSelectedZone from './RegulatoryZoneSelectedZone'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { getHash } from '../../utils'
import { getGearCategory } from '../../domain/use_cases/showLayer'
import { getVectorLayerStyle } from '../../layers/styles/vectorLayerStyles'
import Layers from '../../domain/entities/layers'
import { ReactComponent as CloseIconSVG } from '../icons/Croix_grise.svg'
import { COLORS } from '../../constants/constants'
import { ReactComponent as ShowIconSVG } from '../icons/oeil_affiche.svg'
import { ReactComponent as HideIconSVG } from '../icons/oeil_masque.svg'
import { useSelector } from 'react-redux'

const RegulatoryZoneSelectedLayer = props => {
  const gears = useSelector(state => state.gear.gears)
  const showedLayers = useSelector(state => state.layer.showedLayers)

  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)
  const [showWholeLayer, setShowWholeLayer] = useState(undefined)
  const [atLeastOneLayerIsShowed, setAtLeastOneLayerIsShowed] = useState(false)

  const {
    callRemoveRegulatoryZoneFromMySelection,
    callShowRegulatoryZone,
    callHideRegulatoryZone,
    callShowRegulatorySubZoneMetadata,
    callCloseRegulatoryZoneMetadata,
    callZoomInSubZone,
    showedLayers,
    regulatoryZoneName,
    allowRemoveZone,
    increaseNumberOfZonesOpened,
    decreaseNumberOfZonesOpened,
    regulatorySubZones,
    regulatoryZoneMetadata,
    isLastItem,
    gears,
    isReadyToShowRegulatoryZones
  } = props

  useEffect(() => {
<<<<<<< HEAD
    if (showedLayers && props.regulatoryZoneName) {
=======
    if (showedLayers && regulatoryZoneName) {
>>>>>>> add number of layer and condition for the close icon
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
  }, [regulatoryZoneMetadata, regulatoryZoneName])

  const getRegulatoryLayerName = regulatorySubZones => {
    return {
      layerName: regulatorySubZones[0].layerName
    }
  }

  const displayNumberOfZones = () => {
    const zoneNumber = regulatorySubZones.length
    return (<ZoneNumber >
      {`${zoneNumber} zone${zoneNumber > 1 ? 's' : ''}`}
      </ZoneNumber>
    )
  }

  return (
        <Row>
            <Zone isLastItem={isLastItem} isOpen={isOpen}>
                <Text title={regulatoryZoneName.replace(/[_]/g, ' ')} onClick={() => setIsOpen(!isOpen)}>
                    <ChevronIcon isOpen={isOpen}/>
                    {regulatoryZoneName.replace(/[_]/g, ' ')}
                </Text>
                {displayNumberOfZones()}
                { atLeastOneLayerIsShowed ? <ShowIcon title="Cacher la couche" onClick={() => setShowWholeLayer({ show: false })} /> : <HideIcon title="Afficher la couche" onClick={() => setShowWholeLayer({ show: true })} />}
                { allowRemoveZone && <CloseIcon title="Supprimer la couche de ma sélection" onClick={() => callRemoveRegulatoryZoneFromMySelection(getRegulatoryLayerName(regulatorySubZones), regulatorySubZones.length)}/> }
            </Zone>
            <List
                isOpen={isOpen}
                name={regulatoryZoneName.replace(/\s/g, '-')}
                length={regulatorySubZones.length}>
                {
<<<<<<< HEAD
                    props.regulatorySubZones && showedLayers
                      ? props.regulatorySubZones.map(subZone => {
=======
                    regulatorySubZones && showedLayers
                      ? regulatorySubZones.map(subZone => {
>>>>>>> add number of layer and condition for the close icon
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
<<<<<<< HEAD
                                isReadyToShowRegulatoryZones={props.isReadyToShowRegulatoryZones}
                                callRemoveRegulatoryZoneFromMySelection={props.callRemoveRegulatoryZoneFromMySelection}
                                regulatoryZoneMetadata={props.regulatoryZoneMetadata}
                                showWholeLayer={showWholeLayer}
=======
                                isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
                                callRemoveRegulatoryZoneFromMySelection={callRemoveRegulatoryZoneFromMySelection}
                                callShowRegulatoryZone={callShowRegulatoryZone}
                                callHideRegulatoryZone={callHideRegulatoryZone}
                                callShowRegulatorySubZoneMetadata={callShowRegulatorySubZoneMetadata}
                                callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
                                callZoomInSubZone={callZoomInSubZone}
                                regulatoryZoneMetadata={regulatoryZoneMetadata}
                                showWholeLayer={showWholeLayer}
                                allowRemoveZone={true}
>>>>>>> add number of layer and condition for the close icon
                                zoneIsShown={showedLayers
                                  .filter(layer => layer.type === Layers.REGULATORY.code)
                                  .some(layer =>
                                    layer.zone.layerName === subZone.layerName &&
                                        layer.zone.zone === subZone.zone)}
                            />
                        )
                      })
                      : null
                }
            </List>
        </Row>
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
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  padding-top: 2px;
`

const ShowIcon = styled(ShowIconSVG)`
  width: 23px;
  padding: 0 8px 0 0;
  margin-top: 9px;
  margin-left: 6px;
`

const HideIcon = styled(HideIconSVG)`
  width: 23px;
  padding: 0 8px 0 0;
  margin-top: 9px;
  margin-left: 6px;
`

const Zone = styled.span`
  width: 100%;
  display: flex;
  justify-content: space-between;
  user-select: none;
  ${props => (!props.isOpen && props.isLastItem) ? null : `border-bottom: 1px solid ${COLORS.gray};`}
`

const List = styled.div`
  height: inherit;
  overflow: hidden;
  animation: ${props => props.isOpen ? `list-zones-${props.name}-${props.length}-opening` : `list-zones-${props.name}-${props.length}-closing`} 0.2s ease forwards;

  @keyframes ${props => props.name ? `list-zones-${props.name}-${props.length}-opening` : null} {
    0%   { height: 0px; }
    100% { height: ${props => props.length * 38.5}px; }
  }

  @keyframes ${props => props.name ? `list-zones-${props.name}-${props.length}-closing` : null} {
    0%   { height: ${props => props.length * 38.5}px; }
    100% { height: 0px;   }
  }
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
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 16px;
  margin-right: 5px;
  margin-top: 5px;
  
  animation: ${props => props.isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default RegulatoryZoneSelectedLayer
