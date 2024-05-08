import { ZonePreview } from '@features/Regulation/components/ZonePreview'
import { THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { LayerProperties } from '../../../domain/entities/layers/constants'

import type { RegulatoryZone } from '../../Regulation/types'
import type Feature from 'ol/Feature'

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

  return (
    regulatoryFeatureProperties && (
      <RegulationDetails>
        <StyledZonePreview regulatoryZone={regulatoryFeatureProperties as RegulatoryZone} />
        <Text>
          {regulatoryFeatureProperties?.topic}
          {regulatoryFeatureProperties?.zone && <ZoneName>{regulatoryFeatureProperties?.zone}</ZoneName>}
        </Text>
      </RegulationDetails>
    )
  )
}

const StyledZonePreview = styled(ZonePreview)`
  margin-top: 5px;
`

const Text = styled.span`
  vertical-align: text-bottom;
  margin-top: 3px;
`

const RegulationDetails = styled.span`
  position: absolute;
  vertical-align: center;
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
  background: ${THEME.color.gainsboro};
  font-size: 13px;
  font-weight: 500;
  color: ${THEME.color.charcoal};
`

const ZoneName = styled.span`
  font-weight: 400;
  color: ${p => p.theme.color.gunMetal}
  font-size: 13px;
  margin-left: 10px;
`
