import { ZonePreview } from '@features/Regulation/components/ZonePreview'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { EditIcon } from '../../../commonStyles/icons/EditIcon.style'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import zoomInLayer from '../../../LayersSidebar/useCases/zoomInLayer'
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

  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulatory.regulatoryZoneMetadata)
  const isZoneShown = useMainAppSelector(state =>
    state.layer.showedLayers.some(layer => layer.id === regulatoryZone.id)
  )
  const [isOver, setIsOver] = useState(false)

  const isMetadataShown = regulatoryZoneMetadata?.id === regulatoryZone.id

  const toggleShowRegulatoryZoneMetadata = (zone: RegulatoryZoneType) => {
    if (!isMetadataShown) {
      dispatch(showRegulatoryZoneMetadata(zone))

      return
    }

    dispatch(closeRegulatoryZoneMetadata())
  }

  const toggleShowRegulatoryZone = () => {
    if (!isZoneShown) {
      dispatch(
        showRegulatoryZone({
          type: LayerProperties.REGULATORY.code,
          ...regulatoryZone,
          namespace
        })
      )

      return
    }

    dispatch(
      hideLayer({
        type: LayerProperties.REGULATORY.code,
        ...regulatoryZone,
        namespace
      })
    )
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
      <StyledPreview
        onClick={() => dispatch(zoomInLayer({ topicAndZone: regulatoryZone }))}
        regulatoryZone={regulatoryZone}
      />
      <Name
        data-cy="regulatory-layers-my-zones-zone"
        onClick={toggleShowRegulatoryZone}
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
            title={`Editer la réglementation "${regulatoryZone.zone}"`}
          />
        )}
        {isMetadataShown ? (
          <Icon.Summary
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={() => toggleShowRegulatoryZoneMetadata(regulatoryZone)}
            size={20}
            title={`Fermer la réglementation "${regulatoryZone.zone}"`}
          />
        ) : (
          <Icon.Summary
            color={THEME.color.lightGray}
            onClick={() => toggleShowRegulatoryZoneMetadata(regulatoryZone)}
            size={20}
            title={`Afficher la réglementation "${regulatoryZone.zone}"`}
          />
        )}
        {isZoneShown ? (
          <Icon.Display
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={toggleShowRegulatoryZone}
            size={20}
            title={`Cacher la zone "${regulatoryZone.zone}"`}
          />
        ) : (
          <Icon.Hide
            color={THEME.color.lightGray}
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={toggleShowRegulatoryZone}
            size={20}
            title={`Afficher la zone "${regulatoryZone.zone}"`}
          />
        )}
        {allowRemoveZone && (
          <Icon.Close
            color={THEME.color.slateGray}
            onClick={() => {
              onRemove(regulatoryZone.id)
            }}
            size={15}
            title={`Supprimer la zone "${regulatoryZone.zone}" de ma sélection`}
          />
        )}
      </Icons>
    </Zone>
  )
}

const StyledPreview = styled(ZonePreview)`
  cursor: zoom-in;
`

const Icons = styled.div`
  margin-left: auto;
  margin-right: 0px;
  flex-shrink: 0;
  display: flex;
  height: 36px;
  align-items: center;
  cursor: pointer;

  .Element-IconBox {
    left: auto;
    padding-left: 8px;
  }
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
  padding: 6px 10px 6px 16px;
  user-select: none;

  &:hover {
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
