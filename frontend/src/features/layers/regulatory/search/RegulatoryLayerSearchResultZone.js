import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { getHash } from '../../../../utils'
import { getAdministrativeAndRegulatoryLayersStyle } from '../../../../layers/styles/administrativeAndRegulatoryLayers.style'
import Layers, { getGearCategory } from '../../../../domain/entities/layers'
import { useDispatch, useSelector } from 'react-redux'
import Checkbox from 'rsuite/lib/Checkbox'
import CheckboxGroup from 'rsuite/lib/CheckboxGroup'
import showRegulatoryZoneMetadata from '../../../../domain/use_cases/showRegulatoryZoneMetadata'
import closeRegulatoryZoneMetadata from '../../../../domain/use_cases/closeRegulatoryZoneMetadata'
import { REGPaperDarkIcon, REGPaperIcon } from '../../../commonStyles/icons/REGPaperIcon.style'
import { checkRegulatoryZones, uncheckRegulatoryZones } from './RegulatoryLayerSearch.slice'
import { showOrHideMetadataIcon } from '../RegulatoryLayerZone'

const RegulatoryLayerSearchResultZone = props => {
  const {
    regulatoryZone,
    isOpen,
    regulatoryLayerTopic,
    regulatoryLayerLawType
  } = props
  const dispatch = useDispatch()

  const {
    gears
  } = useSelector(state => state.gear)
  const {
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)
  const {
    regulatoryZonesChecked
  } = useSelector(state => state.regulatoryLayerSearch)

  const [zoneStyle, setZoneStyle] = useState(null)
  const [zoneSelectionList, setZoneSelectionList] = useState([])
  const [metadataIsShown, setMetadataIsShown] = useState(false)

  const showOrHideRegulatoryZoneMetadata = regulatoryZone => {
    if (!metadataIsShown) {
      dispatch(showRegulatoryZoneMetadata(regulatoryZone))
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
    if (zoneSelectionList?.length) {
      dispatch(checkRegulatoryZones([regulatoryZone]))
    } else {
      dispatch(uncheckRegulatoryZones([regulatoryZone]))
    }
  }, [zoneSelectionList])

  useEffect(() => {
    if (!regulatoryZonesChecked || !regulatoryLayerTopic || !regulatoryLayerLawType) {
      return
    }

    if (regulatoryZonesChecked.find(zone => zone.topic === regulatoryZone.topic && zone.zone === regulatoryZone.zone)) {
      if (zoneSelectionList && !zoneSelectionList.length) {
        dispatch(checkRegulatoryZones([regulatoryZone]))
        setZoneSelectionList([regulatoryZone])
      }
    } else {
      if (zoneSelectionList && zoneSelectionList.length) {
        dispatch(uncheckRegulatoryZones([regulatoryZone]))
        setZoneSelectionList([])
      }
    }
  }, [regulatoryZonesChecked, regulatoryLayerTopic, regulatoryLayerLawType])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (regulatoryZone.zone && regulatoryZone.topic && regulatoryZone.gears && gears) {
      const hash = getHash(`${regulatoryZone.topic}:${regulatoryZone.zone}`)
      const gearCategory = getGearCategory(regulatoryZone.gears, gears)

      setZoneStyle(getAdministrativeAndRegulatoryLayersStyle(Layers.REGULATORY.code)(null, hash, gearCategory))
    }
  }, [regulatoryZone, isOpen])

  return (
    <Zone>
      <Rectangle vectorLayerStyle={zoneStyle}/>
      <Name onClick={() => zoneSelectionList?.length
        ? setZoneSelectionList([])
        : setZoneSelectionList([regulatoryZone])}
      >
        {regulatoryZone?.zone ? regulatoryZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}
      </Name>

      {
        isOpen
          ? <>
          {
            metadataIsShown
              ? <CustomREGPaperDarkIcon title="Fermer la réglementation" onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}/>
              : <CustomREGPaperIcon title="Afficher la réglementation" onClick={() => showOrHideRegulatoryZoneMetadata(regulatoryZone)}/>
          }
          <CheckboxGroup
              inline
              name="checkboxList"
              value={zoneSelectionList?.map(zoneSelection => zoneSelection?.zone)}
              onChange={value => value?.length
                ? setZoneSelectionList([regulatoryZone])
                : setZoneSelectionList([])
              }
              style={{ marginLeft: 'auto', height: 20 }}
          >
            <Checkbox
              data-cy={'regulatory-zone-check'}
              value={regulatoryZone.zone}
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
  : COLORS.gray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke()
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
  background: ${props => props.selected ? COLORS.gray : COLORS.background};
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
  height: 23px
`

const CustomREGPaperIcon = styled(REGPaperIcon)`
  ${CustomPaperStyle}
`
const CustomREGPaperDarkIcon = styled(REGPaperDarkIcon)`
  ${CustomPaperStyle}
`

export default RegulatoryLayerSearchResultZone
