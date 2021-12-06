import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import {
  useRouteMatch,
  useHistory
} from 'react-router-dom'
import { useDispatch, useSelector, batch } from 'react-redux'

import { COLORS } from '../../../constants/constants'
import LayersEnum from '../../../domain/entities/layers'

import showRegulatoryZoneMetadata from '../../../domain/use_cases/showRegulatoryZoneMetadata'
import showRegulationToEdit from '../../../domain/use_cases/showRegulationToEdit'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/closeRegulatoryZoneMetadata'
import zoomInLayer from '../../../domain/use_cases/zoomInLayer'
import hideLayer from '../../../domain/use_cases/hideLayer'
import showRegulatoryLayer from '../../../domain/use_cases/showRegulatoryLayer'

import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import { ShowIcon } from '../../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../../commonStyles/icons/HideIcon.style'
import { REGPaperDarkIcon, REGPaperIcon } from '../../commonStyles/icons/REGPaperIcon.style'
import { EditIcon } from '../../commonStyles/icons/EditIcon.style'
import { setRegulatoryZoneToEdit } from '../../../domain/shared_slices/Regulatory'

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

const RegulatoryLayerZone = props => {
  const dispatch = useDispatch()
  const match = useRouteMatch()
  const history = useHistory()
  const ref = useRef()
  const {
    callRemoveRegulatoryZoneFromMySelection,
    regulatoryZone,
    showWholeLayer,
    zoneIsShown,
    allowRemoveZone,
    namespace,
    vectorLayerStyle,
    isLast,
    isEditable
  } = props

  const {
    isReadyToShowRegulatoryLayers,
    regulatoryZoneMetadata,
    regulatoryZoneToEdit
  } = useSelector(state => state.regulatory)

  const [showRegulatoryZone, setShowRegulatoryZone] = useState(undefined)
  const [metadataIsShown, setMetadataIsShown] = useState(false)
  const [isOver, setIsOver] = useState(false)

  useEffect(() => {
    if (ref?.current && regulatoryZoneToEdit === regulatoryZone.zone) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' })
      dispatch(setRegulatoryZoneToEdit(null))
    }
  }, [ref.current, regulatoryZoneToEdit, regulatoryZone.zone])

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

  useEffect(() => {
    if (showWholeLayer) {
      if (!zoneIsShown && showWholeLayer.show) {
        setShowRegulatoryZone(true)
      } else if (zoneIsShown && !showWholeLayer.show) {
        setShowRegulatoryZone(false)
      }
    }
  }, [showWholeLayer])

  useEffect(() => {
    if (zoneIsShown) {
      setShowRegulatoryZone(zoneIsShown)
    }
  }, [zoneIsShown])

  useEffect(() => {
    if (showRegulatoryZone && isReadyToShowRegulatoryLayers) {
      dispatch(showRegulatoryLayer({
        type: LayersEnum.REGULATORY.code,
        ...regulatoryZone,
        namespace
      }))
    } else {
      dispatch(hideLayer({
        type: LayersEnum.REGULATORY.code,
        ...regulatoryZone,
        namespace
      }))
    }
  }, [showRegulatoryZone, isReadyToShowRegulatoryLayers, namespace])

  const onEditRegulationClick = () => {
    history.push(`${match.path}/edit`)
    batch(() => {
      dispatch(showRegulationToEdit(regulatoryZone))
      dispatch(setRegulatoryZoneToEdit(regulatoryZone.zone))
    })
  }

  const onMouseOver = () => !isOver && setIsOver(true)
  const onMouseOut = () => isOver && setIsOver(false)

  return (
    <Zone
      data-cy="regulatory-layer-zone"
      isLast={isLast}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}>
      <Rectangle onClick={() => dispatch(zoomInLayer({ topicAndZone: regulatoryZone }))} vectorLayerStyle={vectorLayerStyle}/>
      <ZoneText
        ref={ref}
        data-cy={'regulatory-layers-my-zones-zone'}
        title={regulatoryZone.zone
          ? regulatoryZone.zone.replace(/[_]/g, ' ')
          : 'AUCUN NOM'}
        onClick={() => setShowRegulatoryZone(!showRegulatoryZone)}
      >
        {
          regulatoryZone.zone
            ? regulatoryZone.zone.replace(/[_]/g, ' ')
            : 'AUCUN NOM'
        }
      </ZoneText>
      <Icons>

        { isEditable &&
          <EditIcon
            data-cy="regulatory-layer-zone-edit"
            $isOver={isOver}
            title="Editer la réglementation"
            onClick={onEditRegulationClick}/>
        }
        {
          metadataIsShown
            ? <REGPaperDarkIcon
              title="Fermer la réglementation"
              onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            />
            : <REGPaperIcon
              data-cy={'regulatory-layers-show-metadata'}
              title="Afficher la réglementation"
              onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            />
        }
        {
          showRegulatoryZone
            ? <ShowIcon
              data-cy={'regulatory-layers-my-zones-zone-hide'}
              title="Cacher la zone"
              onClick={() => setShowRegulatoryZone(!showRegulatoryZone)}
            />
            : <HideIcon
              data-cy={'regulatory-layers-my-zones-zone-show'}
              title="Afficher la zone"
              onClick={() => setShowRegulatoryZone(!showRegulatoryZone)}
            />
        }
        {allowRemoveZone && <CloseIcon title="Supprimer la zone de ma sélection"
                                       data-cy={'regulatory-layers-my-zones-zone-delete'}
                                       onClick={() => callRemoveRegulatoryZoneFromMySelection(regulatoryZone, 1)}/>}
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
  : null}

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

export default RegulatoryLayerZone
