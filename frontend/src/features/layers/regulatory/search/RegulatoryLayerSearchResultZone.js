import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { getHash } from '../../../../utils'
import { getVectorLayerStyle } from '../../../../layers/styles/vectorLayers.style'
import Layers, { getGearCategory } from '../../../../domain/entities/layers'
import { useSelector } from 'react-redux'
import Checkbox from 'rsuite/lib/Checkbox'
import CheckboxGroup from 'rsuite/lib/CheckboxGroup'

const RegulatoryLayerSearchResultZone = props => {
  const {
    regulatoryZone,
    isOpen
  } = props

  const gears = useSelector(state => state.gear.gears)
  const [zoneStyle, setZoneStyle] = useState(null)
  const [isSelected, setIsSelected] = useState([])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (regulatoryZone.zone && regulatoryZone.topic && regulatoryZone.gears && gears) {
      const hash = getHash(`${regulatoryZone.topic}:${regulatoryZone.zone}`)
      const gearCategory = getGearCategory(regulatoryZone.gears, gears)

      setZoneStyle(getVectorLayerStyle(Layers.REGULATORY.code)(null, hash, gearCategory))
    }
  }, [regulatoryZone, isOpen])

  return (
    <Zone>
      <Rectangle vectorLayerStyle={zoneStyle}/>
      <Name>{regulatoryZone.zone ? regulatoryZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}</Name>
      {
        isOpen
          ? <CheckboxGroup
              inline
              name="checkboxList"
              value={isSelected}
              onChange={setIsSelected}
              style={{ marginLeft: 'auto', height: 20 }}
            >
              <Checkbox value={regulatoryZone.zone}/>
            </CheckboxGroup>
          : null
      }
    </Zone>
  )
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
  flex-shrink: 0;
`

const Zone = styled.span`
  user-select: none;
  display: flex;
  font-size: 13px;
  padding-left: 20px;
  background: ${props => props.selected ? COLORS.gray : COLORS.background};
  color: ${COLORS.gunMetal};
  padding-top: 1px;
  padding-bottom: 8px;
  
  .rs-checkbox-checker {
    padding-top: 24px;
  }
`

export default RegulatoryLayerSearchResultZone
