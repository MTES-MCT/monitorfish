import { addRegulatoryZonesToMyLayers, regulatoryActions } from '@features/Regulation/slice'
import { hideRegulatoryZoneLayerById } from '@features/Regulation/useCases/hideRegulatoryZoneLayerById'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { LayerSliceNamespace } from '../../../../domain/entities/layers/types'
import { closeRegulatoryZoneMetadata } from '../../useCases/closeRegulatoryZoneMetadata'
import { showRegulatoryZoneMetadata } from '../../useCases/showRegulatoryZoneMetadata'
import { ZonePreview } from '../ZonePreview'

import type { RegulatoryZone } from '../../types'

export type RegulatoryLayerSearchResultZoneProps = {
  isOpen: boolean
  regulatoryZone: RegulatoryZone
}
export function ResultZone({ isOpen, regulatoryZone }: RegulatoryLayerSearchResultZoneProps) {
  const dispatch = useMainAppDispatch()
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulatory.regulatoryZoneMetadata)
  const selectedRegulatoryLayers = useMainAppSelector(state => state.regulatory.selectedRegulatoryLayers)
  const isMetadataShown = regulatoryZoneMetadata?.id === regulatoryZone.id

  const isZoneAlreadySelected = useMemo(() => {
    if (!selectedRegulatoryLayers) {
      return false
    }

    const selectedRegulatoryLayersZone = selectedRegulatoryLayers[regulatoryZone.topic]
    if (!selectedRegulatoryLayersZone) {
      return false
    }

    return !!selectedRegulatoryLayersZone.find(zone => zone.id === regulatoryZone.id)
  }, [regulatoryZone.id, regulatoryZone.topic, selectedRegulatoryLayers])

  const showOrHideRegulatoryZoneMetadata = (partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>) => {
    if (!isMetadataShown) {
      dispatch(showRegulatoryZoneMetadata(partialRegulatoryZone, true))
    } else {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }

  function toggleCheckZone() {
    if (isZoneAlreadySelected) {
      dispatch(hideRegulatoryZoneLayerById(regulatoryZone.id, LayerSliceNamespace.homepage))
      dispatch(regulatoryActions.removeSelectedZoneById(regulatoryZone.id))

      return
    }

    dispatch(addRegulatoryZonesToMyLayers([regulatoryZone]))
  }

  return (
    <Zone>
      <ZonePreview regulatoryZone={regulatoryZone} />
      <Name
        /* eslint-disable-next-line react/jsx-no-bind */
        onClick={toggleCheckZone}
      >
        {regulatoryZone.zone ?? 'AUCUN NOM'}
      </Name>
      {isOpen && (
        <>
          {isMetadataShown ? (
            <Icon.Summary
              /* eslint-disable-next-line react/jsx-no-bind */
              onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              size={20}
              title={`Fermer la réglementation "${regulatoryZone.zone}"`}
            />
          ) : (
            <Icon.Summary
              color={THEME.color.lightGray}
              /* eslint-disable-next-line react/jsx-no-bind */
              onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              size={20}
              title={`Afficher la réglementation "${regulatoryZone.zone}"`}
            />
          )}
          <StyledIconButton
            accent={Accent.TERTIARY}
            aria-label={`Sélectionner "${regulatoryZone.zone}"`}
            color={isZoneAlreadySelected ? THEME.color.blueGray : THEME.color.gunMetal}
            Icon={isZoneAlreadySelected ? Icon.PinFilled : Icon.Pin}
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={toggleCheckZone}
            title={`Sélectionner "${regulatoryZone.zone}"`}
          />
        </>
      )}
    </Zone>
  )
}

const StyledIconButton = styled(IconButton)`
  height: 20px;
  margin-right: 2px;
  margin-left: 2px;
`

const Name = styled.span`
  flex-grow: 1;
  font-size: inherit;
  line-height: 1;
  padding-right: 6px;
  overflow-x: hidden !important;
  text-overflow: ellipsis;
  padding-bottom: 5px;
  padding-top: 5px;
`

const Zone = styled.span<{
  $selected?: boolean
}>`
  align-items: center;
  background: ${p => (p.$selected ? p.theme.color.lightGray : p.theme.color.white)};
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  font-size: 13px;
  height: 24px;
  padding: 6px 0 6px 20px;
  user-select: none;

  &:hover {
    background: ${p => p.theme.color.blueGray25};
  }

  > svg {
    margin: 0;
  }
`
