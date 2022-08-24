import React, { useEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import Layers, { getGearCategory } from '../../../domain/entities/layers'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import showRegulatoryZoneMetadata from '../../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import zoomInLayer from '../../../domain/use_cases/layer/zoomInLayer'
import hideLayer from '../../../domain/use_cases/layer/hideLayer'
import showRegulatoryZone from '../../../domain/use_cases/layer/regulation/showRegulatoryZone'
import showRegulationToEdit from '../../../domain/use_cases/layer/regulation/showRegulationToEdit'
import { getHash } from '../../../utils'
import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import { HideIcon } from '../../commonStyles/icons/HideIcon.style'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { PaperDarkIcon, PaperIcon } from '../../commonStyles/icons/REGPaperIcon.style'
import { EditIcon } from '../../commonStyles/icons/EditIcon.style'
import {
  addRegulatoryTopicOpened,
  closeRegulatoryZoneMetadataPanel,
  removeRegulatoryTopicOpened,
} from '../../../domain/shared_slices/Regulatory'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../layers/styles/administrativeAndRegulatoryLayers.style'

export function showOrHideMetadataIcon(regulatoryZoneMetadata, regulatoryZone, setMetadataIsShown) {
  if (
    regulatoryZoneMetadata &&
    regulatoryZone &&
    (regulatoryZone.topic !== regulatoryZoneMetadata.topic || regulatoryZone.zone !== regulatoryZoneMetadata.zone)
  ) {
    setMetadataIsShown(false)
  } else if (
    regulatoryZoneMetadata &&
    regulatoryZone &&
    regulatoryZone.topic === regulatoryZoneMetadata.topic &&
    regulatoryZone.zone === regulatoryZoneMetadata.zone
  ) {
    setMetadataIsShown(true)
  } else if (!regulatoryZoneMetadata && regulatoryZone) {
    setMetadataIsShown(false)
  }
}

function RegulatoryZone(props) {
  const dispatch = useDispatch()
  const match = useRouteMatch()
  const history = useHistory()
  const ref = useRef()
  const {
    allowRemoveZone,
    callRemoveRegulatoryZoneFromMySelection,
    isEditable,
    isLast,
    namespace,
    regulatoryTopic,
    regulatoryZone
  } = props

  const { isReadyToShowRegulatoryLayers, regulatoryZoneMetadata } = useSelector(state => state.regulatory)
  const gears = useSelector(state => state.gear.gears)
  const zoneIsShown = useSelector(state => state.layer.showedLayers.some(layer => layer.id === regulatoryZone?.id))

  const [metadataIsShown, setMetadataIsShown] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const [vectorLayerStyle, setVectorLayerStyle] = useState(false)

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
    if (regulatoryZone.zone && regulatoryZone.topic && gears) {
      const hash = getHash(`${regulatoryZone.topic}:${regulatoryZone.zone}`)
      const gearCategory = getGearCategory(regulatoryZone.gearsRegulation, gears)
      setVectorLayerStyle(getAdministrativeAndRegulatoryLayersStyle(Layers.REGULATORY.code)(null, hash, gearCategory))
    }
  }, [regulatoryZone, gears])

  useEffect(() => {
    showOrHideMetadataIcon(regulatoryZoneMetadata, regulatoryZone, setMetadataIsShown)
  }, [regulatoryZoneMetadata, regulatoryZone])

  const triggerShowRegulatoryZone = () => {
    if (!zoneIsShown && isReadyToShowRegulatoryLayers) {
      dispatch(
        showRegulatoryZone({
          type: Layers.REGULATORY.code,
          ...regulatoryZone,
          namespace,
        }),
      )
    } else {
      dispatch(
        hideLayer({
          type: Layers.REGULATORY.code,
          ...regulatoryZone,
          namespace,
        }),
      )
    }
  }

  const onEditRegulationClick = () => {
    history.push(`${match.path}/edit`)
    batch(() => {
      dispatch(showRegulationToEdit(regulatoryZone))
      dispatch(removeRegulatoryTopicOpened(regulatoryTopic))
      dispatch(addRegulatoryTopicOpened(regulatoryTopic))
      dispatch(closeRegulatoryZoneMetadataPanel())
    })
  }

  const onMouseOver = () => !isOver && setIsOver(true)
  const onMouseOut = () => isOver && setIsOver(false)

  return (
    <Zone ref={ref} data-cy="regulatory-layer-zone" isLast={isLast} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <Rectangle
        onClick={() => dispatch(zoomInLayer({ topicAndZone: regulatoryZone }))}
        vectorLayerStyle={vectorLayerStyle}
      />
      <ZoneText
        data-cy={'regulatory-layers-my-zones-zone'}
        onClick={triggerShowRegulatoryZone}
        title={regulatoryZone.zone
          ? regulatoryZone.zone
          : 'AUCUN NOM'}
      >
        {regulatoryZone.zone ? regulatoryZone.zone : 'AUCUN NOM'}
      </ZoneText>
      <Icons>
        {isEditable && (
          <EditIcon
            $isOver={isOver}
            data-cy="regulatory-layer-zone-edit"
            onClick={onEditRegulationClick}
            title="Editer la réglementation"/>
          />
        )}
        {metadataIsShown ? (
          <PaperDarkIcon
            onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
              title="Fermer la réglementation"
          />
        ) : (
          <PaperIcon
            data-cy={'regulatory-layers-show-metadata'}
              onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
              title="Afficher la réglementation"
          />
        )}
        {zoneIsShown ? (
          <ShowIcon
            data-cy={'regulatory-layers-my-zones-zone-hide'}
              onClick={triggerShowRegulatoryZone}
              title="Cacher la zone"
          />
        ) : (
          <HideIcon
            data-cy={'regulatory-layers-my-zones-zone-show'}
              onClick={triggerShowRegulatoryZone}
              title="Afficher la zone"
          />
        )}
        {allowRemoveZone ? (
          <CloseIcon
            data-cy={'regulatory-layers-my-zones-zone-delete'}
                         onClick={() => callRemoveRegulatoryZoneFromMySelection(regulatoryZone, 1, namespace)}
                         title="Supprimer la zone de ma sélection"/>
          />
        ) : null}
      </Icons>
    </Zone>
  )
}

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props =>
    props.vectorLayerStyle && props.vectorLayerStyle.getFill()
      ? props.vectorLayerStyle.getFill().getColor()
      : COLORS.gray};
  border: 1px solid
    ${props =>
      props.vectorLayerStyle && props.vectorLayerStyle.getStroke()
        ? props.vectorLayerStyle.getStroke().getColor()
        : COLORS.grayDarkerTwo};
  display: inline-block;
  margin-right: 10px;
  margin-left: 2px;
  margin-top: 7px;
  cursor: zoom-in;
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
  ${props => (props.isLast ? `border-bottom: 1px solid ${COLORS.lightGray}; height: 27px;` : 'height: 28px;')}

  :hover {
    background: ${COLORS.shadowBlueLittleOpacity};
  }
`

const ZoneText = styled.span`
  width: 63%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
  padding-left: 0;
  margin-top: 5px;
`

export default React.memo(RegulatoryZone)
