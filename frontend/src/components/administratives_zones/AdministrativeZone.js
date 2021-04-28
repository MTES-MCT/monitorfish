import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as ShowIconSVG } from '../icons/oeil_affiche.svg'
import { ReactComponent as HideIconSVG } from '../icons/oeil_masque.svg'
import styled from 'styled-components'

const AdministrativeZone = props => {
  const firstUpdate = useRef(true)
  const [showLayer_, setShowLayer] = useState(undefined)

  useEffect(() => {
    if (showLayer_ === undefined) {
      setShowLayer(props.isShownOnInit)
    }
  }, [props.isShownOnInit, showLayer_])

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    if (showLayer_) {
      if (props.layer.showMultipleZonesInAdministrativeZones) {
        props.callShowAdministrativeZone(props.layer.groupCode, props.layer.code)
      } else {
        props.callShowAdministrativeZone(props.layer.code)
      }
    } else {
      if (props.layer.showMultipleZonesInAdministrativeZones) {
        props.callHideAdministrativeZone(props.layer.groupCode, props.layer.code)
      } else {
        props.callHideAdministrativeZone(props.layer.code)
      }
    }
  }, [showLayer_])

  return <>{
        props.layer
          ? <Row isGrouped={props.isGrouped} onClick={() => setShowLayer(!showLayer_)}>
                    <LayerName title={props.layer.name}>{props.layer.name}</LayerName>
                    { showLayer_ ? <ShowIcon /> : <HideIcon />}
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
  width: 21px;
  padding: 0 7px 0 0;
  height: 1.5em;
  float: right;
`

const HideIcon = styled(HideIconSVG)`
  width: 21px;
  padding: 0 7px 0 0;
  height: 1.5em;
  float: right;
`

export default AdministrativeZone
