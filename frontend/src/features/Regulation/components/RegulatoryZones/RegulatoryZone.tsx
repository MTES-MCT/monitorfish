import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { CloseIcon } from '../../../commonStyles/icons/CloseIcon.style'
import { EditIcon } from '../../../commonStyles/icons/EditIcon.style'
import { HideIcon } from '../../../commonStyles/icons/HideIcon.style'
import { ShowIcon } from '../../../commonStyles/icons/ShowIcon.style'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import zoomInLayer from '../../../LayersSidebar/useCases/zoomInLayer'
import { getRegulatoryLayerStyle } from '../../layers/styles/regulatoryLayer.style'
import { addRegulatoryTopicOpened, closeRegulatoryZoneMetadataPanel, removeRegulatoryTopicOpened } from '../../slice'
import { closeRegulatoryZoneMetadata } from '../../useCases/closeRegulatoryZoneMetadata'
import showRegulationToEdit from '../../useCases/showRegulationToEdit'
import showRegulatoryZone from '../../useCases/showRegulatoryZone'
import { showRegulatoryZoneMetadata } from '../../useCases/showRegulatoryZoneMetadata'

import type { LayerSliceNamespace } from '../../../../domain/entities/layers/types'
import type { RegulatoryZone as RegulatoryZoneType } from '../../types'
import type { Promisable } from 'type-fest'

export type RegulatoryZoneProps = {
  allowRemoveZone: boolean
  isEditable: boolean
  isLast: boolean
  namespace: LayerSliceNamespace
  onRemove: (id: number | string) => Promisable<void>
  regulatoryTopic: string
  regulatoryZone: RegulatoryZoneType
}
function UnmemoizedRegulatoryZone({
  allowRemoveZone,
  isEditable,
  isLast,
  namespace,
  onRemove,
  regulatoryTopic,
  regulatoryZone
}: RegulatoryZoneProps) {
  const dispatch = useMainAppDispatch()
  const navigate = useNavigate()

  const { isReadyToShowRegulatoryLayers, regulatoryZoneMetadata } = useMainAppSelector(state => state.regulatory)
  const zoneIsShown = useMainAppSelector(state =>
    state.layer.showedLayers.some(layer => layer.id === regulatoryZone.id)
  )

  const isMetadataShown = regulatoryZoneMetadata?.id === regulatoryZone.id
  const [isOver, setIsOver] = useState(false)
  const vectorLayerStyle = getRegulatoryLayerStyle(undefined, regulatoryZone)

  const callShowRegulatoryZoneMetadata = (zone: RegulatoryZoneType) => {
    if (!isMetadataShown) {
      dispatch(showRegulatoryZoneMetadata(zone))
    } else {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }

  const triggerShowRegulatoryZone = () => {
    if (!zoneIsShown && isReadyToShowRegulatoryLayers) {
      dispatch(
        showRegulatoryZone({
          type: LayerProperties.REGULATORY.code,
          ...regulatoryZone,
          namespace
        })
      )
    } else {
      dispatch(
        hideLayer({
          type: LayerProperties.REGULATORY.code,
          ...regulatoryZone,
          namespace
        })
      )
    }
  }

  const onEditRegulationClick = () => {
    dispatch(showRegulationToEdit(regulatoryZone))
    dispatch(removeRegulatoryTopicOpened(regulatoryTopic))
    dispatch(addRegulatoryTopicOpened(regulatoryTopic))
    dispatch(closeRegulatoryZoneMetadataPanel())

    navigate('/backoffice/regulation/edit')
  }

  const onMouseEnter = () => !isOver && setIsOver(true)
  const onMouseLeave = () => isOver && setIsOver(false)

  return (
    <Zone $isLast={isLast} data-cy="regulatory-layer-zone" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Rectangle
        $vectorLayerStyle={vectorLayerStyle}
        onClick={() => dispatch(zoomInLayer({ topicAndZone: regulatoryZone }))}
      />
      <Name
        data-cy="regulatory-layers-my-zones-zone"
        onClick={triggerShowRegulatoryZone}
        title={regulatoryZone.zone ? regulatoryZone.zone : 'AUCUN NOM'}
      >
        {regulatoryZone.zone ? regulatoryZone.zone : 'AUCUN NOM'}
      </Name>
      <Icons>
        {isEditable && (
          <EditIcon
            $isOver={isOver}
            data-cy="regulatory-layer-zone-edit"
            onClick={onEditRegulationClick}
            title="Editer la réglementation"
          />
        )}
        {isMetadataShown ? (
          <StyledIconSummary
            onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            size={20}
            title="Fermer la réglementation"
          />
        ) : (
          <StyledIconSummary
            color={THEME.color.lightGray}
            data-cy="regulatory-layers-show-metadata"
            onClick={() => callShowRegulatoryZoneMetadata(regulatoryZone)}
            size={20}
            title="Afficher la réglementation"
          />
        )}
        {zoneIsShown ? (
          <ShowIcon
            data-cy="regulatory-layers-my-zones-zone-hide"
            onClick={triggerShowRegulatoryZone}
            style={{ marginTop: 2 }}
            title="Cacher la zone"
          />
        ) : (
          <HideIcon
            data-cy="regulatory-layers-my-zones-zone-show"
            onClick={triggerShowRegulatoryZone}
            style={{ marginTop: 2 }}
            title="Afficher la zone"
          />
        )}
        {allowRemoveZone && (
          <CloseIcon
            data-cy="regulatory-layers-my-zones-zone-delete"
            onClick={() => {
              onRemove(regulatoryZone.id)
            }}
            style={{ marginTop: -2 }}
            title="Supprimer la zone de ma sélection"
          />
        )}
      </Icons>
    </Zone>
  )
}

const StyledIconSummary = styled(Icon.Summary)`
  margin-right: 6px;
  margin-top: 2px;
`

const Rectangle = styled.div<{
  // TODO I don't understand this `ol/Style` type. Properly type that.
  $vectorLayerStyle: any
}>`
  background: ${p =>
    p.$vectorLayerStyle && p.$vectorLayerStyle.getFill()
      ? p.$vectorLayerStyle.getFill()?.getColor()
      : p.theme.color.lightGray};
  border: 1px solid
    ${p =>
      p.$vectorLayerStyle && p.$vectorLayerStyle.getStroke()
        ? p.$vectorLayerStyle.getStroke()?.getColor()
        : p.theme.color.slateGray};
  cursor: zoom-in;
  display: inline-block;
  margin-right: 10px;
  height: 14px;
  min-width: 14px;
  width: 14px;
`

const Icons = styled.span`
  float: right;
  display: flex;
  justify-content: flex-end;
  flex: 1;
  height: 23px;
`

const Zone = styled.span<{
  $isLast: boolean
}>`
  align-items: center;
  border-bottom: 1px solid ${p => (p.$isLast ? p.theme.color.lightGray : p.theme.color.white)};
  display: flex;
  font-size: 13px;
  font-weight: 300;
  height: 23px;
  padding: 6px 0 6px 20px;
  user-select: none;

  :hover {
    background: ${p => p.theme.color.blueGray25};
  }
`

const Name = styled.span`
  flex-grow: 1;
  line-height: 1;
  padding-right: 6px;
  overflow-x: hidden !important;
  text-overflow: ellipsis;
  padding-top: 5px;
  padding-bottom: 5px;
`

export const RegulatoryZone = memo(UnmemoizedRegulatoryZone)
