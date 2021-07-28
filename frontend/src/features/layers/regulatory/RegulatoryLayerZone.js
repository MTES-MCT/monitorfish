import React, { useEffect, useState } from 'react'
import { ReactComponent as ShowIconSVG } from '../../icons/oeil_affiche.svg'
import { ReactComponent as HideIconSVG } from '../../icons/oeil_masque.svg'
import styled, { css } from 'styled-components'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as REGPaperSVG } from '../../icons/reg_paper.svg'
import { ReactComponent as REGPaperDarkSVG } from '../../icons/reg_paper_dark.svg'
import { COLORS } from '../../../constants/constants'
import showLayer from '../../../domain/use_cases/showLayer'
import LayersEnum from '../../../domain/entities/layers'
import showRegulatoryZoneMetadata from '../../../domain/use_cases/showRegulatoryZoneMetadata'
import { useDispatch } from 'react-redux'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/closeRegulatoryZoneMetadata'
import zoomInZone from '../../../domain/use_cases/zoomInSubZone'
import hideLayers from '../../../domain/use_cases/hideLayers'

const RegulatoryLayerZone = props => {
  const dispatch = useDispatch()
  const {
    callRemoveRegulatoryZoneFromMySelection,
    regulatoryZoneMetadata,
    subZone,
    showWholeLayer,
    zoneIsShown,
    isReadyToShowRegulatoryLayers,
    allowRemoveZone,
    namespace
  } = props

  const [showZone, setShowZone] = useState(undefined)
  const [metadataIsShown, setMetadataIsShown] = useState(false)

  const callShowRegulatoryZoneMetadata = subZone => {
    if (!metadataIsShown) {
      dispatch(showRegulatoryZoneMetadata(subZone))
      setMetadataIsShown(true)
    } else {
      dispatch(closeRegulatoryZoneMetadata())
      setMetadataIsShown(false)
    }
  }

  useEffect(() => {
    if (regulatoryZoneMetadata &&
      subZone &&
      (subZone.layerName !== regulatoryZoneMetadata.layerName ||
        subZone.zone !== regulatoryZoneMetadata.zone)) {
      setMetadataIsShown(false)
    } else if (regulatoryZoneMetadata &&
      subZone &&
      (subZone.layerName === regulatoryZoneMetadata.layerName &&
        subZone.zone === regulatoryZoneMetadata.zone)) {
      setMetadataIsShown(true)
    } else if (!regulatoryZoneMetadata && subZone) {
      setMetadataIsShown(false)
    }
  }, [regulatoryZoneMetadata, subZone])

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
      dispatch(showLayer({
        type: LayersEnum.REGULATORY.code,
        zone: props.subZone,
        namespace
      }))
    } else {
      dispatch(hideLayers({
        type: LayersEnum.REGULATORY.code,
        zone: props.subZone,
        namespace
      }))
    }
  }, [showZone, isReadyToShowRegulatoryLayers, namespace])

  return (
    <SubZone>
      <Rectangle onClick={() => dispatch(zoomInZone({ subZone: props.subZone }))} vectorLayerStyle={props.vectorLayerStyle}/>
      <SubZoneText
        title={subZone.zone ? subZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}
        onClick={() => setShowZone(!showZone)}>
        {subZone.zone ? subZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}
      </SubZoneText>
      <Icons>
        {
          metadataIsShown
            ? <REGPaperDarkIcon title="Fermer la réglementation" onClick={() => callShowRegulatoryZoneMetadata(subZone)}/>
            : <REGPaperIcon title="Afficher la réglementation" onClick={() => callShowRegulatoryZoneMetadata(subZone)}/>
        }
        {showZone
          ? <ShowIcon title="Cacher la zone" onClick={() => setShowZone(!showZone)}/>
          : <HideIcon
            title="Afficher la zone" onClick={() => setShowZone(!showZone)}/>}
        {allowRemoveZone && <CloseIcon title="Supprimer la zone de ma sélection"
                                       onClick={() => callRemoveRegulatoryZoneFromMySelection(subZone, 1)}/>}
      </Icons>
    </SubZone>
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

const SubZone = styled.span`
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

const SubZoneText = styled.span`
  width: 63%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
  padding-left: 0;
  margin-top: 8px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  margin-top: 7px;
  margin-left: 8px;
`
const baseREGPaperIcon = css`
  width: 17px;
  align-self: center;
  margin-right: 12px;
`
const REGPaperIcon = styled(REGPaperSVG)`
  ${baseREGPaperIcon}
`

const REGPaperDarkIcon = styled(REGPaperDarkSVG)`
  ${baseREGPaperIcon}
`
const baseIcon = css`
  flex: 0 0 24px;
  align-self: center;
`
const ShowIcon = styled(ShowIconSVG)`
  ${baseIcon}
`

const HideIcon = styled(HideIconSVG)`
  ${baseIcon}
`

export default RegulatoryLayerZone
