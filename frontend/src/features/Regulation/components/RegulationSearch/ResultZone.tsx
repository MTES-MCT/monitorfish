import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, Icon, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { checkRegulatoryZones, uncheckRegulatoryZones } from './slice'
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
  const zoneIsChecked = useMainAppSelector(
    state => !!state.regulatoryLayerSearch.regulatoryZonesChecked?.find(zone => zone.id === regulatoryZone.id)
  )
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
      return
    }

    if (!zoneIsChecked) {
      dispatch(checkRegulatoryZones([regulatoryZone]))

      return
    }

    dispatch(uncheckRegulatoryZones([regulatoryZone]))
  }

  return (
    <Zone>
      <ZonePreview regulatoryZone={regulatoryZone} />
      <Name
        /* eslint-disable-next-line react/jsx-no-bind */
        onClick={toggleCheckZone}
      >
        {regulatoryZone?.zone ?? 'AUCUN NOM'}
      </Name>
      {isOpen && (
        <>
          {isMetadataShown ? (
            <Icon.Summary
              /* eslint-disable-next-line react/jsx-no-bind */
              onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              size={20}
              title="Fermer la réglementation"
            />
          ) : (
            <Icon.Summary
              color={THEME.color.lightGray}
              /* eslint-disable-next-line react/jsx-no-bind */
              onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              size={20}
              title="Afficher la réglementation"
            />
          )}
          <StyledCheckbox
            checked={zoneIsChecked || isZoneAlreadySelected}
            data-cy="regulatory-zone-check"
            label=""
            name={`${regulatoryZone.id}-checkbox`}
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={toggleCheckZone}
            readOnly={isZoneAlreadySelected}
            title={isZoneAlreadySelected ? 'zone déjà ajoutée à mes zones réglementaires' : ''}
          />
        </>
      )}
    </Zone>
  )
}

const StyledCheckbox = styled(Checkbox)`
  height: 20px;
  margin-right: 2px;
  margin-left: 8px;
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

  :hover {
    background: ${p => p.theme.color.blueGray25};
  }

  > svg {
    margin: 0;
  }
`
