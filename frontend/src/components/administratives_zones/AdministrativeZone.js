import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as ShowIconSVG } from '../icons/oeil_affiche.svg'
import { ReactComponent as HideIconSVG } from '../icons/oeil_masque.svg'
import styled from 'styled-components'

const AdministrativeZone = props => {
  const {
    isShownOnInit,
    layer,
    callShowAdministrativeZone,
    callHideAdministrativeZone,
    isGrouped
  } = props

  const firstUpdate = useRef(true)
  const [showLayer_, setShowLayer] = useState(undefined)

  useEffect(() => {
    if (showLayer_ === undefined) {
      setShowLayer(props.isShownOnInit)
    }
  }, [isShownOnInit, showLayer_])

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    if (showLayer_) {
      if (layer.showMultipleZonesInAdministrativeZones) {
        callShowAdministrativeZone(layer.groupCode, props.layer.code)
      } else {
        callShowAdministrativeZone(layer.code)
      }
    } else {
      if (layer.showMultipleZonesInAdministrativeZones) {
        callHideAdministrativeZone(layer.groupCode, props.layer.code)
      } else {
        callHideAdministrativeZone(layer.code)
      }
    }
  }, [showLayer_])

  return <>{
    props.layer
      ? <Row isGrouped={isGrouped} onClick={() => setShowLayer(!showLayer_)}>
        <LayerName title={layer.name}>{layer.name}</LayerName>
        {showLayer_ ? <ShowIcon/> : <HideIcon/>}
      </Row>
      : null
  }</>
}

const LayerName = styled.span`
  width: 85%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
`

const Row = styled.span`
  width: ${props => props.isGrouped ? '303px' : '97%'};;
  display: block;
  line-height: 1.9em;
  padding-left: 10px;
  user-select: none;
  padding-left: 10px;
  margin-left: ${props => props.isGrouped ? '20px' : '0'};
`

const ShowIcon = styled(ShowIconSVG)`
  width: 23px;
  padding: 0 7px 0 0;
  height: 1.5em;
  float: right;
`

const HideIcon = styled(HideIconSVG)`
  width: 23px;
  padding: 0 7px 0 0;
  height: 1.5em;
  float: right;
`

export default AdministrativeZone
