/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { getHash } from '../../../utils'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../layers/styles/administrativeAndRegulatoryLayers.style'
import Layers, { getGearCategory } from '../../../domain/entities/layers'

const LayerDetailsBox = props => {
  const {
    feature,
    gears
  } = props

  const [vectorLayerStyle, setVectorLayerStyle] = useState(null)
  const [regulatoryFeatureToShowOnCard, setRegulatoryFeatureToShowOnCard] = useState(null)

  useEffect(() => {
    if (feature?.getId()?.toString()?.includes(`${Layers.REGULATORY.code}`)) {
      setRegulatoryFeatureToShowOnCard(feature)
    } else {
      setRegulatoryFeatureToShowOnCard(null)
    }
  }, [feature, setRegulatoryFeatureToShowOnCard])

  useEffect(() => {
    if (regulatoryFeatureToShowOnCard) {
      const {
        zone,
        topic,
        gears: layerGears
      } = regulatoryFeatureToShowOnCard.getProperties()

      if (zone && topic && gears) {
        const hash = getHash(`${topic}:${zone}`)
        const gearCategory = getGearCategory(layerGears, gears)
        setVectorLayerStyle(getAdministrativeAndRegulatoryLayersStyle(Layers.REGULATORY.code)(null, hash, gearCategory))
      } else {
        setVectorLayerStyle(null)
      }
    }
  }, [regulatoryFeatureToShowOnCard, gears, setVectorLayerStyle])

  return (regulatoryFeatureToShowOnCard && <Details>
    {
      regulatoryFeatureToShowOnCard && <>
        <Rectangle vectorLayerStyle={vectorLayerStyle}/>
        <Text>
          {regulatoryFeatureToShowOnCard.getProperties().topic}
          {
            regulatoryFeatureToShowOnCard.getProperties().zone
              ? <ZoneName>{regulatoryFeatureToShowOnCard.getProperties().zone}</ZoneName>
              : null
          }
        </Text>
      </>
    }
  </Details>)
}

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.vectorLayerStyle?.getFill() ? props.vectorLayerStyle.getFill().getColor() : props.theme.color.lightGray};
  border: 1px solid ${props => props.vectorLayerStyle?.getStroke() ? props.vectorLayerStyle.getStroke().getColor() : props.theme.color.slateGray};
  margin-right: 7px;
  margin-top: 5px;
`

const Text = styled.span`
  vertical-align: text-bottom;
  margin-top: 3px;
`

const Details = styled.span`
  position: absolute;
  bottom: 10px;
  left: 420px;
  display: flex;
  margin: 1px;
  padding: 0 10px 4px 10px;
  text-decoration: none;
  text-align: center;
  height: 21px;
  border: none;
  border-radius: 2px;
  background: ${COLORS.gainsboro};
  font-size: 13px;
  font-weight: 500;
  color: ${COLORS.charcoal};
`

const ZoneName = styled.span`
  font-weight: 400;
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  margin-left: 10px;
`

export default LayerDetailsBox
