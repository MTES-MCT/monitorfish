import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled, { css } from 'styled-components'
import { Checkbox, CheckboxGroup } from 'rsuite'
import { showRegulatoryZoneMetadata } from '../../../../../domain/use_cases/layer/regulation/showRegulatoryZoneMetadata'
import { closeRegulatoryZoneMetadata } from '../../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'

import { checkRegulatoryZones, uncheckRegulatoryZones } from './RegulatoryLayerSearch.slice'
import { showOrHideMetadataIcon } from '../RegulatoryZone'
import { PaperDarkIcon, PaperIcon } from '../../../../commonStyles/icons/REGPaperIcon.style'
import { COLORS } from '../../../../../constants/constants'
import { theme } from '../../../../../ui/theme'
import { getRegulatoryLayerStyle } from '../../../../map/layers/styles/regulatoryLayer.style'

const RegulatoryLayerSearchResultZone = props => {
  const {
    regulatoryZone,
    isOpen
  } = props
  const dispatch = useDispatch()

  const {
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)
  const zoneIsChecked = useSelector(state => !!state.regulatoryLayerSearch
    .regulatoryZonesChecked?.find(zone => zone.id === regulatoryZone.id))
  const zoneIsAlreadySelected = useSelector(state => state.regulatory
    .selectedRegulatoryLayers[regulatoryZone.topic]?.find(zone => zone.id === regulatoryZone.id))

  const zoneStyle = getRegulatoryLayerStyle(undefined, regulatoryZone)
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

  return (
    <Zone>
      <Rectangle vectorLayerStyle={zoneStyle}/>
      <Name onClick={() => zoneIsChecked
        ? dispatch(uncheckRegulatoryZones([regulatoryZone]))
        : dispatch(checkRegulatoryZones([regulatoryZone]))}
      >
        {regulatoryZone?.zone ? regulatoryZone.zone : 'AUCUN NOM'}
      </Name>
      {
        isOpen
          ? <>
          {
            metadataIsShown
              ? <CustomREGPaperDarkIcon
                title="Fermer la réglementation"
                onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              />
              : <CustomREGPaperIcon
                title="Afficher la réglementation"
                onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}
              />
          }
          <CheckboxGroup
              inline
              name="checkboxList"
              value={zoneIsChecked || zoneIsAlreadySelected ? [regulatoryZone.id] : []}
              onChange={_ => zoneIsChecked
                ? dispatch(uncheckRegulatoryZones([regulatoryZone]))
                : dispatch(checkRegulatoryZones([regulatoryZone]))}
              style={{ marginLeft: 'auto', height: 20 }}
          >
            <Checkbox
              title={zoneIsAlreadySelected ? 'zone déjà ajoutée à mes zones réglementaires' : ''}
              disabled={!!zoneIsAlreadySelected}
              data-cy={'regulatory-zone-check'}
              value={regulatoryZone?.id}
            />
          </CheckboxGroup>
          </>
          : null
      }
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
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill()
  ? props.vectorLayerStyle.getFill().getColor()
  : props.theme.color.lightGray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke()
  ? props.vectorLayerStyle.getStroke().getColor()
  : props.theme.color.lightGray};
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
  background: ${props => props.selected ? props.theme.color.lightGray : props.theme.color.white};
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
    background: ${theme.color.blueGray["25"]};
  }
`

const CustomPaperStyle = css`
  margin-right: -2px;
  padding-top: 7px;
  width: 21px;
  height: 23px
`

const CustomREGPaperIcon = styled(PaperIcon)`
  ${CustomPaperStyle}
`
const CustomREGPaperDarkIcon = styled(PaperDarkIcon)`
  ${CustomPaperStyle}
`

export default RegulatoryLayerSearchResultZone
