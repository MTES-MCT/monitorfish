import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { ReactComponent as REGPaperSVG } from '../../icons/reg_paper.svg'
import { ReactComponent as REGPaperDarkSVG } from '../../icons/reg_paper_dark.svg'
import { COLORS } from '../../../constants/constants'
import LayersEnum from '../../../domain/entities/layers'
import showRegulatoryZoneMetadata from '../../../domain/use_cases/showRegulatoryZoneMetadata'
import { useDispatch, useSelector } from 'react-redux'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/closeRegulatoryZoneMetadata'
import zoomInLayer from '../../../domain/use_cases/zoomInLayer'
import hideLayer from '../../../domain/use_cases/hideLayer'
import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import showRegulatoryLayer from '../../../domain/use_cases/showRegulatoryLayer'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../../commonStyles/icons/HideIcon.style'

const RegulatoryLayerZone = props => {
  const dispatch = useDispatch()
  const {
    callRemoveRegulatoryZoneFromMySelection,
    zone,
    showWholeLayer,
    zoneIsShown,
    allowRemoveZone,
    namespace,
    vectorLayerStyle
  } = props

  const {
    isReadyToShowRegulatoryLayers,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

  const [showZone, setShowZone] = useState(undefined)
  const [metadataIsShown, setMetadataIsShown] = useState(false)

  const callShowRegulatoryZoneMetadata = zone => {
    if (!metadataIsShown) {
      dispatch(showRegulatoryZoneMetadata(zone))
      setMetadataIsShown(true)
    } else {
      dispatch(closeRegulatoryZoneMetadata())
      setMetadataIsShown(false)
    }
  }

  useEffect(() => {
    if (regulatoryZoneMetadata && zone &&
      (zone.topic !== regulatoryZoneMetadata.topic ||
        zone.zone !== regulatoryZoneMetadata.zone)) {
      setMetadataIsShown(false)
    } else if (regulatoryZoneMetadata && zone &&
      (zone.topic === regulatoryZoneMetadata.topic &&
        zone.zone === regulatoryZoneMetadata.zone)) {
      setMetadataIsShown(true)
    } else if (!regulatoryZoneMetadata && zone) {
      setMetadataIsShown(false)
    }
  }, [regulatoryZoneMetadata, zone])

  useEffect(() => {
    if (showWholeLayer) {
      if (!zoneIsShown && showWholeLayer.show) {
        setShowZone(true)
      } else if (zoneIsShown && !showWholeLayer.show) {
        setShowZone(false)
      }
    }
  }, [showWholeLayer])

  useEffect(() => {
    if (zoneIsShown) {
      setShowZone(zoneIsShown)
    }
  }, [zoneIsShown])

  useEffect(() => {
    if (showZone && isReadyToShowRegulatoryLayers) {
      dispatch(showRegulatoryLayer({ ...zone, namespace }))
    } else {
      dispatch(hideLayer({
        type: LayersEnum.REGULATORY.code,
        ...zone,
        namespace
      }))
    }
  }, [showZone, isReadyToShowRegulatoryLayers, namespace])

  return (
    <Zone>
      <Rectangle onClick={() => dispatch(zoomInLayer({ subZone: zone }))} vectorLayerStyle={vectorLayerStyle}/>
      <ZoneText
        title={zone.zone ? zone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}
        onClick={() => setShowZone(!showZone)}
      >
        {
          zone.zone
            ? zone.zone.replace(/[_]/g, ' ')
            : 'AUCUN NOM'
        }
      </ZoneText>
      <Icons>
        {
          metadataIsShown
            ? <REGPaperDarkIcon title="Fermer la réglementation" onClick={() => callShowRegulatoryZoneMetadata(zone)}/>
            : <REGPaperIcon title="Afficher la réglementation" onClick={() => callShowRegulatoryZoneMetadata(zone)}/>
        }
        {showZone
          ? <ShowIcon title="Cacher la zone" onClick={() => setShowZone(!showZone)}/>
          : <HideIcon
            title="Afficher la zone" onClick={() => setShowZone(!showZone)}/>}
        {allowRemoveZone && <CloseIcon title="Supprimer la zone de ma sélection"
                                       onClick={() => callRemoveRegulatoryZoneFromMySelection(zone, 1)}/>}
      </Icons>
    </Zone>
  )
}

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill() ? props.vectorLayerStyle.getFill().getColor() : COLORS.gray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke() ? props.vectorLayerStyle.getStroke().getColor() : COLORS.grayDarkerTwo};
  display: inline-block;
  margin-right: 10px;
  margin-left: 2px;
  margin-top: 9px;
`

const Icons = styled.span`
  float: right;
  display: flex;
  justify-content: flex-end;
  flex: 1;
`

const Zone = styled.span`
  display: flex;
  justify-content: flex-start;
  line-height: 1.9em;
  padding-left: 31px;
  padding-top: 4px;
  padding-bottom: 4px;
  user-select: none;
  font-size: 13px;
  font-weight: 300;
`

const ZoneText = styled.span`
  width: 63%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
  padding-left: 0;
  margin-top: 8px;
`

const baseREGPaperIcon = css`
  width: 20px;
  align-self: center;
  margin-right: 7px;
`
const REGPaperIcon = styled(REGPaperSVG)`
  ${baseREGPaperIcon}
`

const REGPaperDarkIcon = styled(REGPaperDarkSVG)`
  ${baseREGPaperIcon}
`

export default RegulatoryLayerZone
