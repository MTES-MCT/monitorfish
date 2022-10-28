import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../../commonStyles/icons/HideIcon.style'
import { COLORS } from '../../../constants/constants'

const AdministrativeLayer = props => {
  const {
    isShownOnInit,
    layer,
    callShowAdministrativeZone,
    callHideAdministrativeZone,
    isGrouped,
    isFirst
  } = props

  const [showLayer_, setShowLayer] = useState(undefined)

  useEffect(() => {
    if (showLayer_ === undefined) {
      setShowLayer(props.isShownOnInit)
    }
  }, [isShownOnInit, showLayer_])

  useEffect(() => {
    if (showLayer_) {
      if (layer.showMultipleZonesInAdministrativeZones) {
        callShowAdministrativeZone(layer.groupCode, layer.code)
      } else {
        callShowAdministrativeZone(layer.code)
      }
    } else {
      if (layer.showMultipleZonesInAdministrativeZones) {
        callHideAdministrativeZone(layer.groupCode, layer.code)
      } else {
        callHideAdministrativeZone(layer.code)
      }
    }
  }, [showLayer_])

  return <>
    {
      props.layer
        ? <Row
          isFirst={isFirst}
          isGrouped={isGrouped}
          onClick={() => setShowLayer(!showLayer_)}
          data-cy={'administrative-layer-toggle'}
        >
          <LayerName
            title={layer.name}
          >
            {layer.name}
          </LayerName>
          {
            showLayer_
              ? <ShowIcon/>
              : <HideIcon/>
          }
        </Row>
        : null
    }
  </>
}

const LayerName = styled.span`
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-top: 5px;
`

const Row = styled.span`
  margin-top: ${props => props.isFirst ? 5 : 0}px;
  padding: ${props => props.isGrouped ? '4px 0 3px 20px' : '4px 0 4px 20px'};
  padding-left: ${props => props.isGrouped ? '38px' : '20px'};
  line-height: 18px;
  display: block;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;

  :hover {
    background: ${p => p.theme.color.blueYonder[25]};
  }
`

export default AdministrativeLayer
