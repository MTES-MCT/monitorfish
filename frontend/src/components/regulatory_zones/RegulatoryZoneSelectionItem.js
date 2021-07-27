import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { getHash } from '../../utils'
import { getVectorLayerStyle } from '../../layers/styles/vectorLayer.style'
import { getGearCategory } from '../../domain/use_cases/showLayer'
import Layers from '../../domain/entities/layers'
import { useSelector } from 'react-redux'

const RegulatoryZoneSelectionItem = props => {
  const gears = useSelector(state => state.gear.gears)

  const [globalIsSelected, setGlobalIsSelected] = useState(undefined)

  const select = subZone => {
    if (!subZone) {
      if (!globalIsSelected) {
        props.toggleSelectRegulatoryZone(props.regulatoryZoneName, props.regulatorySubZones.filter(subZone => {
          return props.regulatoryZonesSelection[props.regulatoryZoneName] ? !props.regulatoryZonesSelection[props.regulatoryZoneName].some(selectedSubZone => selectedSubZone.zone === subZone.zone) : true
        }))
      } else {
        props.toggleSelectRegulatoryZone(props.regulatoryZoneName, props.regulatorySubZones)
      }
      setGlobalIsSelected(!globalIsSelected)
    } else {
      props.toggleSelectRegulatoryZone(props.regulatoryZoneName, [subZone])
    }
  }

  useEffect(() => {
    setGlobalIsSelected(props.regulatoryZonesSelection[props.regulatoryZoneName] ? props.regulatoryZonesSelection[props.regulatoryZoneName].length === props.regulatorySubZones.length : false)
  }, [props.regulatoryZonesSelection])

  const isSelected = (regulatoryZone, subZone) => {
    return regulatoryZone ? regulatoryZone.some(regulatoryZone => regulatoryZone.zone === subZone.zone) : false
  }

  return (<Row>
    <Zone selected={globalIsSelected} onClick={() => select()}>
      {props.regulatoryZoneName.replace(/[_]/g, ' ')}
    </Zone>
    {
      props.regulatorySubZones
        ? props.regulatorySubZones.map((subZone) => {
          let vectorLayerStyle
          if (subZone.zone && subZone.layerName && subZone.gears && gears) {
            const hash = getHash(`${subZone.layerName}:${subZone.zone}`)
            const gearCategory = getGearCategory(subZone.gears, gears)
            vectorLayerStyle = getVectorLayerStyle(Layers.REGULATORY.code)(null, hash, gearCategory)
          }

          return (<SubZone
            onClick={() => select(subZone)}
            selected={globalIsSelected || (!globalIsSelected && isSelected(props.regulatoryZonesSelection[props.regulatoryZoneName], subZone))}
            key={subZone.zone}>
            <Rectangle vectorLayerStyle={vectorLayerStyle}/>
            <Name>{subZone.zone ? subZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}</Name>
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
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill() ? props.vectorLayerStyle.getFill().getColor() : COLORS.gray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke() ? props.vectorLayerStyle.getStroke().getColor() : COLORS.grayDarkerTwo};
  display: inline-block;
  margin-right: 10px;
  margin-top: 9px;
`

const Zone = styled.span`
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

export default RegulatoryZoneSelectionItem
