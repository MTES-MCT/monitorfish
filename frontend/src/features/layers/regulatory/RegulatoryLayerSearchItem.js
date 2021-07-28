import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { getHash } from '../../../utils'
import { getVectorLayerStyle } from '../../../layers/styles/vectorLayer.style'
import { getGearCategory } from '../../../domain/use_cases/showLayer'
import Layers from '../../../domain/entities/layers'
import { useSelector } from 'react-redux'

const RegulatoryLayerSearchItem = props => {
  const {
    toggleSelectRegulatoryZone,
    regulatoryLayerTopic,
    regulatoryLayerZones,
    regulatoryLayersSelected
  } = props

  const gears = useSelector(state => state.gear.gears)

  const [globalIsSelected, setGlobalIsSelected] = useState(undefined)

  const select = subZone => {
    if (!subZone) {
      if (!globalIsSelected) {
        toggleSelectRegulatoryZone(regulatoryLayerTopic, regulatoryLayerZones.filter(subZone => {
          return regulatoryLayersSelected[regulatoryLayerTopic]
            ? !regulatoryLayersSelected[regulatoryLayerTopic].some(selectedSubZone => selectedSubZone.zone === subZone.zone)
            : true
        }))
      } else {
        toggleSelectRegulatoryZone(regulatoryLayerTopic, regulatoryLayerZones)
      }
      setGlobalIsSelected(!globalIsSelected)
    } else {
      toggleSelectRegulatoryZone(regulatoryLayerTopic, [subZone])
    }
  }

  useEffect(() => {
    setGlobalIsSelected(regulatoryLayersSelected[regulatoryLayerTopic]
      ? regulatoryLayersSelected[regulatoryLayerTopic].length === regulatoryLayerZones.length
      : false)
  }, [regulatoryLayersSelected])

  const isSelected = (regulatoryZone, subZone) => {
    return regulatoryZone ? regulatoryZone.some(regulatoryZone => regulatoryZone.zone === subZone.zone) : false
  }

  return (<Row>
    <LayerTopic selected={globalIsSelected} onClick={() => select()}>
      {regulatoryLayerTopic.replace(/[_]/g, ' ')}
    </LayerTopic>
    {
      regulatoryLayerZones
        ? regulatoryLayerZones.map((layerZone) => {
          let vectorLayerStyle
          if (layerZone.zone && layerZone.layerName && layerZone.gears && gears) {
            const hash = getHash(`${layerZone.layerName}:${layerZone.zone}`)
            const gearCategory = getGearCategory(layerZone.gears, gears)
            vectorLayerStyle = getVectorLayerStyle(Layers.REGULATORY.code)(null, hash, gearCategory)
          }

          return (<SubZone
            onClick={() => select(layerZone)}
            selected={globalIsSelected || (!globalIsSelected && isSelected(regulatoryLayersSelected[regulatoryLayerTopic], layerZone))}
            key={layerZone.zone}>
            <Rectangle vectorLayerStyle={vectorLayerStyle}/>
            <Name>{layerZone.zone ? layerZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}</Name>
          </SubZone>)
        })
        : null
    }
  </Row>)
}

const Name = styled.span`
  width: 280px;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  font-size: inherit;
  margin-top: 8px;
`

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill()
  ? props.vectorLayerStyle.getFill().getColor()
  : COLORS.gray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke()
  ? props.vectorLayerStyle.getStroke().getColor()
  : COLORS.grayDarkerTwo};
  display: inline-block;
  margin-right: 10px;
  margin-top: 9px;
`

const LayerTopic = styled.span`
  user-select: none;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  padding-right: 10px;
  display: block;
  line-height: 2.7em;
  font-size: 13px;
  padding-left: 18px;
  font-weight: 500;
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${props => props.selected ? COLORS.lightGray : COLORS.gray};
  background: ${props => props.selected ? COLORS.gray : COLORS.background};
`

const SubZone = styled.span`
  user-select: none;
  display: flex;
  font-size: 13px;
  padding-left: 20px;
  padding-right: 10px;
  background: ${props => props.selected ? COLORS.gray : COLORS.background};
  border-bottom: 1px solid ${props => props.selected ? COLORS.lightGray : COLORS.gray};
  color: ${COLORS.gunMetal};
  padding-top: 1px;
  padding-bottom: 8px;
`

const Row = styled.div`
  width: 100%;
  display: block;
`

export default RegulatoryLayerSearchItem
