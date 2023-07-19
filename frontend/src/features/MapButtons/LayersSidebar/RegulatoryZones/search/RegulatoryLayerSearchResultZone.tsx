import { useEffect, useState } from 'react'
import { Checkbox, CheckboxGroup } from 'rsuite'
import styled, { css } from 'styled-components'

import { checkRegulatoryZones, uncheckRegulatoryZones } from './slice'
import { closeRegulatoryZoneMetadata } from '../../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { showRegulatoryZoneMetadata } from '../../../../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { theme } from '../../../../../ui/theme'
import { PaperDarkIcon, PaperIcon } from '../../../../commonStyles/icons/REGPaperIcon.style'
import { getRegulatoryLayerStyle } from '../../../../map/layers/styles/regulatoryLayer.style'
import { showOrHideMetadataIcon } from '../RegulatoryZone'

import type { RegulatoryZone } from '../../../../../domain/types/regulation'

export type RegulatoryLayerSearchResultZoneProps = {
  isOpen: boolean
  regulatoryZone: RegulatoryZone
}
export function RegulatoryLayerSearchResultZone({ isOpen, regulatoryZone }: RegulatoryLayerSearchResultZoneProps) {
  const dispatch = useMainAppDispatch()

  const { regulatoryZoneMetadata } = useMainAppSelector(state => state.regulatory)
  const zoneIsChecked = useMainAppSelector(
    state => !!state.regulatoryLayerSearch.regulatoryZonesChecked?.find(zone => zone.id === regulatoryZone.id)
  )
  const zoneIsAlreadySelected = useMainAppSelector(state => {
    const { selectedRegulatoryLayers } = state.regulatory
    if (!selectedRegulatoryLayers) {
      return false
    }

    const selectedRegulatoryLayersZone = selectedRegulatoryLayers[regulatoryZone.topic]
    if (!selectedRegulatoryLayersZone) {
      return false
    }

    return selectedRegulatoryLayersZone.find(zone => zone.id === regulatoryZone.id)
  })

  const zoneStyle = getRegulatoryLayerStyle(undefined, regulatoryZone)
  const [metadataIsShown, setMetadataIsShown] = useState(false)

  const showOrHideRegulatoryZoneMetadata = (partialRegulatoryZone: Pick<RegulatoryZone, 'topic' | 'zone'>) => {
    if (!metadataIsShown) {
      dispatch(showRegulatoryZoneMetadata(partialRegulatoryZone, true))
      setMetadataIsShown(true)
    } else {
      dispatch(closeRegulatoryZoneMetadata())
      setMetadataIsShown(false)
    }
  }

  useEffect(() => {
    showOrHideMetadataIcon(regulatoryZoneMetadata, regulatoryZone, setMetadataIsShown)
  }, [regulatoryZoneMetadata, regulatoryZone])

  return (
    <Zone>
      <Rectangle vectorLayerStyle={zoneStyle} />
      <Name
        onClick={() =>
          zoneIsChecked
            ? dispatch(uncheckRegulatoryZones([regulatoryZone]))
            : dispatch(checkRegulatoryZones([regulatoryZone]))
        }
      >
        {regulatoryZone?.zone ? regulatoryZone.zone : 'AUCUN NOM'}
      </Name>
      {isOpen ? (
        <>
          {metadataIsShown ? (
            <CustomREGPaperDarkIcon
              onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              title="Fermer la réglementation"
            />
          ) : (
            <CustomREGPaperIcon
              onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              title="Afficher la réglementation"
            />
          )}
          <CheckboxGroup
            inline
            name="checkboxList"
            onChange={() =>
              zoneIsChecked
                ? dispatch(uncheckRegulatoryZones([regulatoryZone]))
                : dispatch(checkRegulatoryZones([regulatoryZone]))
            }
            style={{ height: 20, marginLeft: 'auto' }}
            value={zoneIsChecked || zoneIsAlreadySelected ? [regulatoryZone.id] : []}
          >
            {[
              <Checkbox
                key={regulatoryZone.id}
                data-cy="regulatory-zone-check"
                disabled={!!zoneIsAlreadySelected}
                title={zoneIsAlreadySelected ? 'zone déjà ajoutée à mes zones réglementaires' : ''}
                value={regulatoryZone.id}
              />
            ]}
          </CheckboxGroup>
        </>
      ) : null}
    </Zone>
  )
}

const Name = styled.span`
  width: 280px;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  font-size: inherit;
  margin-top: 8px;
`

const Rectangle = styled.div<{
  vectorLayerStyle: any
}>`
  width: 14px;
  height: 14px;
  background: ${p =>
    p.vectorLayerStyle && p.vectorLayerStyle.getFill()
      ? p.vectorLayerStyle.getFill().getColor()
      : p.theme.color.lightGray};
  border: 1px solid
    ${p =>
      p.vectorLayerStyle && p.vectorLayerStyle.getStroke()
        ? p.vectorLayerStyle.getStroke().getColor()
        : p.theme.color.lightGray};
  display: inline-block;
  margin-right: 10px;
  margin-top: 9px;
  flex-shrink: 0;
`

const Zone = styled.span<{
  $selected?: boolean
}>`
  user-select: none;
  display: flex;
  font-size: 13px;
  padding-left: 20px;
  background: ${p => (p.$selected ? p.theme.color.lightGray : p.theme.color.white)};
  color: ${p => p.theme.color.gunMetal};
  padding-top: 1px;
  padding-bottom: 5px;

  .rs-checkbox-checker {
    padding-top: 24px;
    margin-left: 0;
  }

  .rs-checkbox-inline {
    width: 36px;
    margin-left: 0px;
  }

  :hover {
    background: ${theme.color.blueGray['25']};
  }
`

const CustomPaperStyle = css`
  margin-right: -2px;
  padding-top: 7px;
  width: 21px;
  height: 23px;
`

const CustomREGPaperIcon = styled(PaperIcon)`
  ${CustomPaperStyle}
`
const CustomREGPaperDarkIcon = styled(PaperDarkIcon)`
  ${CustomPaperStyle}
`
