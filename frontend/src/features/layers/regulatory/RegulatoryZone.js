import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { COLORS } from '../../../constants/constants'
import { Layer } from '../../../domain/entities/layers/constants'

import { showRegulatoryZoneMetadata } from '../../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import { closeRegulatoryZoneMetadata } from '../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import zoomInLayer from '../../../domain/use_cases/layer/zoomInLayer'
import hideLayer from '../../../domain/use_cases/layer/hideLayer'
import showRegulatoryZone from '../../../domain/use_cases/layer/regulation/showRegulatoryZone'
import showRegulationToEdit from '../../../domain/use_cases/layer/regulation/showRegulationToEdit'

import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../../commonStyles/icons/HideIcon.style'
import { PaperDarkIcon, PaperIcon } from '../../commonStyles/icons/REGPaperIcon.style'
import { EditIcon } from '../../commonStyles/icons/EditIcon.style'
import {
  addRegulatoryTopicOpened,
  closeRegulatoryZoneMetadataPanel,
  removeRegulatoryTopicOpened
} from '../../../domain/shared_slices/Regulatory'
import { getAdministrativeLayerStyle } from '../../map/layers/styles/administrativeLayer.style'
import { theme } from '../../../ui/theme'
import { getRegulatoryLayerStyle } from '../../map/layers/styles/regulatoryLayer.style'

export function showOrHideMetadataIcon (regulatoryZoneMetadata, regulatoryZone, setMetadataIsShown) {
  if (regulatoryZoneMetadata && regulatoryZone &&
    (regulatoryZone.topic !== regulatoryZoneMetadata.topic ||
      regulatoryZone.zone !== regulatoryZoneMetadata.zone)) {
    setMetadataIsShown(false)
  } else if (regulatoryZoneMetadata && regulatoryZone &&
    (regulatoryZone.topic === regulatoryZoneMetadata.topic &&
      regulatoryZone.zone === regulatoryZoneMetadata.zone)) {
    setMetadataIsShown(true)
  } else if (!regulatoryZoneMetadata && regulatoryZone) {
    setMetadataIsShown(false)
  }
}

const RegulatoryZone = props => {
  const dispatch = useDispatch()
  const match = useRouteMatch()
  const history = useHistory()
  const {
    callRemoveRegulatoryZoneFromMySelection,
    regulatoryZone,
    allowRemoveZone,
    namespace,
    isLast,
    isEditable,
    regulatoryTopic
  } = props

  const {
    isReadyToShowRegulatoryLayers,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)
  const zoneIsShown = useSelector(state =>
    state.layer.showedLayers.some(layer => layer.id === regulatoryZone?.id))

  const [metadataIsShown, setMetadataIsShown] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const vectorLayerStyle = getRegulatoryLayerStyle(undefined, regulatoryZone)

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
    showOrHideMetadataIcon(regulatoryZoneMetadata, regulatoryZone, setMetadataIsShown)
  }, [regulatoryZoneMetadata, regulatoryZone])

  const triggerShowRegulatoryZone = () => {
    if (!zoneIsShown && isReadyToShowRegulatoryLayers) {
      dispatch(showRegulatoryZone({
        type: Layer.REGULATORY.code,
        ...regulatoryZone,
        namespace
      }))
    } else {
      dispatch(hideLayer({
        type: Layer.REGULATORY.code,
        ...regulatoryZone,
        namespace
      }))
    }
  }

  const onEditRegulationClick = () => {
    dispatch(showRegulationToEdit(regulatoryZone))
    history.push(`${match.path}/edit`)
    dispatch(removeRegulatoryTopicOpened(regulatoryTopic))
    dispatch(addRegulatoryTopicOpened(regulatoryTopic))
    dispatch(closeRegulatoryZoneMetadataPanel())
  }

  const onMouseEnter = () => !isOver && setIsOver(true)
  const onMouseLeave = () => isOver && setIsOver(false)

  return (
    <Zone
      data-cy="regulatory-layer-zone"
      isLast={isLast}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Rectangle onClick={() => dispatch(zoomInLayer({ topicAndZone: regulatoryZone }))} vectorLayerStyle={vectorLayerStyle}/>
      <ZoneText
        data-cy={'regulatory-layers-my-zones-zone'}
        title={regulatoryZone.zone
          ? regulatoryZone.zone
          : 'AUCUN NOM'}
        onClick={triggerShowRegulatoryZone}
      >
        {
          regulatoryZone.zone
            ? regulatoryZone.zone
            : 'AUCUN NOM'
        }
      </ZoneText>
      <Icons>
        { isEditable &&
          <EditIcon
            data-cy="regulatory-layer-zone-edit"
            $isOver={isOver}
            title="Editer la réglementation"
            onClick={onEditRegulationClick}
          />
        }
        {
          metadataIsShown
            ? <PaperDarkIcon
              title="Fermer la réglementation"
              onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            />
            : <PaperIcon
              data-cy={'regulatory-layers-show-metadata'}
              title="Afficher la réglementation"
              onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            />
        }
        {
          zoneIsShown
            ? <ShowIcon
              data-cy={'regulatory-layers-my-zones-zone-hide'}
              title="Cacher la zone"
              onClick={triggerShowRegulatoryZone}
            />
            : <HideIcon
              data-cy={'regulatory-layers-my-zones-zone-show'}
              title="Afficher la zone"
              onClick={triggerShowRegulatoryZone}
            />
        }
        {
          allowRemoveZone
            ? <CloseIcon title="Supprimer la zone de ma sélection"
                         data-cy={'regulatory-layers-my-zones-zone-delete'}
                         onClick={() => callRemoveRegulatoryZoneFromMySelection(regulatoryZone, 1, namespace)}/>
            : null
        }
      </Icons>
    </Zone>
  )
}

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill() ? props.vectorLayerStyle.getFill().getColor() : props.theme.color.lightGray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke() ? props.vectorLayerStyle.getStroke().getColor() : props.theme.color.slateGray};
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
  ${props => props.isLast
  ? `border-bottom: 1px solid ${COLORS.lightGray}; height: 27px;`
  : 'height: 28px;'}

  :hover {
    background: ${theme.color.blueGray["25"]};
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
