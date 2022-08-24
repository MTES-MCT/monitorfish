import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, CheckboxGroup } from 'rsuite'
import styled, { css } from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import Layers, { getGearCategory } from '../../../../domain/entities/layers'
import closeRegulatoryZoneMetadata from '../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import showRegulatoryZoneMetadata from '../../../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../../layers/styles/administrativeAndRegulatoryLayers.style'
import { getHash } from '../../../../utils'
import { PaperDarkIcon, PaperIcon } from '../../../commonStyles/icons/REGPaperIcon.style'
import { showOrHideMetadataIcon } from '../RegulatoryZone'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './RegulatoryLayerSearch.slice'

function RegulatoryLayerSearchResultZone(props) {
  const { isOpen, regulatoryZone } = props
  const dispatch = useDispatch()

  const { gears } = useSelector(state => state.gear)
  const { regulatoryZoneMetadata } = useSelector(state => state.regulatory)
  const zoneIsChecked = useSelector(
    state => !!state.regulatoryLayerSearch.regulatoryZonesChecked?.find(zone => zone.id === regulatoryZone.id),
  )
  const zoneIsAlreadySelected = useSelector(state =>
    state.regulatory.selectedRegulatoryLayers[regulatoryZone.topic]?.find(zone => zone.id === regulatoryZone.id),
  )

  const [zoneStyle, setZoneStyle] = useState(null)
  const [metadataIsShown, setMetadataIsShown] = useState(false)

  const showOrHideRegulatoryZoneMetadata = _regulatoryZone => {
    if (!metadataIsShown) {
      dispatch(showRegulatoryZoneMetadata(_regulatoryZone, true))
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
    if (!isOpen) {
      return
    }

    if (regulatoryZone.zone && regulatoryZone.topic && gears) {
      const hash = getHash(`${regulatoryZone.topic}:${regulatoryZone.zone}`)
      const gearCategory = getGearCategory(regulatoryZone.gears, gears)

      setZoneStyle(getAdministrativeAndRegulatoryLayersStyle(Layers.REGULATORY.code)(null, hash, gearCategory))
    }
  }, [regulatoryZone, isOpen, gears])

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
            onChange={_ =>
              zoneIsChecked
                ? dispatch(uncheckRegulatoryZones([regulatoryZone]))
                : dispatch(checkRegulatoryZones([regulatoryZone]))
            }
            style={{ height: 20, marginLeft: 'auto' }}
            value={zoneIsChecked || zoneIsAlreadySelected ? [regulatoryZone.id] : []}
          >
            <Checkbox
              data-cy="regulatory-zone-check"
              disabled={!!zoneIsAlreadySelected}
              title={zoneIsAlreadySelected ? 'zone déjà ajoutée à mes zones réglementaires' : ''}
              value={regulatoryZone?.id}
            />
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
  margin-top: 9px;
  flex-shrink: 0;
`

const Zone = styled.span`
  user-select: none;
  display: flex;
  font-size: 13px;
  padding-left: 20px;
  background: ${props => (props.selected ? COLORS.gray : COLORS.background)};
  color: ${COLORS.gunMetal};
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
    background: ${COLORS.shadowBlueLittleOpacity};
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

export default RegulatoryLayerSearchResultZone
