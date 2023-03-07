import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { getRegulatoryLayerStyle } from '../layers/styles/regulatoryLayer.style'

import type { BaseRegulatoryZone } from '../../../domain/types/regulation'
import type Feature from 'ol/Feature'
import type Style from 'ol/style/Style'

type LayerDetailsBoxProps = {
  feature: Feature
}
export function LayerDetailsBox({ feature }: LayerDetailsBoxProps) {
  const regulatoryFeatureProperties = useMemo(() => {
    if (!feature.getId()?.toString()?.includes(`${LayerProperties.REGULATORY.code}`)) {
      return null
    }

    return feature.getProperties()
  }, [feature])

  const vectorLayerStyle = useMemo(
    () => getRegulatoryLayerStyle(undefined, regulatoryFeatureProperties as BaseRegulatoryZone),
    [regulatoryFeatureProperties]
  )

  return (
    regulatoryFeatureProperties && (
      <RegulationDetails>
        <Rectangle vectorLayerStyle={vectorLayerStyle} />
        <Text>
          {regulatoryFeatureProperties?.topic}
          {regulatoryFeatureProperties?.zone && <ZoneName>{regulatoryFeatureProperties?.zone}</ZoneName>}
        </Text>
      </RegulationDetails>
    )
  )
}

const Rectangle = styled.div<{
  vectorLayerStyle: Style
}>`
  width: 14px;
  height: 14px;
  background: ${p =>
    p.vectorLayerStyle?.getFill() ? p.vectorLayerStyle.getFill().getColor()?.toString() : p.theme.color.lightGray};
  border: 1px solid
    ${p =>
      p.vectorLayerStyle?.getStroke() ? p.vectorLayerStyle.getStroke().getColor().toString() : p.theme.color.slateGray};
  margin-right: 7px;
  margin-top: 5px;
`

const Text = styled.span`
  vertical-align: text-bottom;
  margin-top: 3px;
`

const RegulationDetails = styled.span`
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
  color: ${p => p.theme.color.gunMetal}
  font-size: 13px;
  margin-left: 10px;
`
