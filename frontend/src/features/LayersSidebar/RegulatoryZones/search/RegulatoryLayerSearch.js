import React, { useEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { resetRegulatoryZonesChecked, setRegulatoryLayersSearchResult } from './RegulatoryLayerSearch.slice'

import layer from '../../../../domain/shared_slices/Layer'
import {
  addRegulatoryZonesToMyLayers,
  closeRegulatoryZoneMetadataPanel,
  resetRegulatoryGeometriesToPreview
} from '../../../../domain/shared_slices/Regulatory'
import { useEscapeFromKeyboard } from '../../../../hooks/useEscapeFromKeyboard'

import RegulatoryLayerSearchResultList from './RegulatoryLayerSearchResultList'
import { RegulatoryLayerSearchInput } from './RegulatoryLayerSearchInput'
import { COLORS } from '../../../../constants/constants'

const RegulatoryLayerSearch = props => {
  const {
    namespace,
    numberOfRegulatoryLayersSaved,
    setNumberOfRegulatoryLayersSaved,
    layersSidebarIsOpen
  } = props

  const dispatch = useDispatch()
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions
  const { layersSidebarOpenedLayerType } = useSelector(state => state.layer)
  const {
    regulatoryLayersSearchResult,
    regulatoryZonesChecked
  } = useSelector(state => state.regulatoryLayerSearch)

  const escape = useEscapeFromKeyboard()
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (layersSidebarOpenedLayerType !== undefined) {
      batch(() => {
        dispatch(resetRegulatoryGeometriesToPreview())
        dispatch(resetRegulatoryZonesChecked())
        // dispatch(setRegulatoryLayersSearchResult(null))
      })
    }
  }, [layersSidebarOpenedLayerType])

  useEffect(() => {
    if (escape) {
      batch(() => {
        dispatch(resetRegulatoryGeometriesToPreview())
        dispatch(setRegulatoryLayersSearchResult(null))
        dispatch(resetRegulatoryZonesChecked())
        dispatch(closeRegulatoryZoneMetadataPanel())
      })
    }
  }, [escape])

  useEffect(() => {
    if (regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0) {
      dispatch(setLayersSideBarOpenedLayerType(undefined))
    }
  }, [regulatoryLayersSearchResult])

  function saveRegulatoryLayers (_regulatoryZonesChecked) {
    setNumberOfRegulatoryLayersSaved(_regulatoryZonesChecked.length)
    setTimeout(() => { setNumberOfRegulatoryLayersSaved(0) }, 2000)
    batch(() => {
      dispatch(addRegulatoryZonesToMyLayers(_regulatoryZonesChecked))
      dispatch(resetRegulatoryZonesChecked())
    })
  }

  return (
    <Search ref={wrapperRef}>
      <RegulatoryLayerSearchInput/>
      <RegulatoryLayerSearchResultList namespace={namespace}/>
      <AddRegulatoryLayer
        data-cy={'regulatory-search-add-zones-button'}
        onClick={() => saveRegulatoryLayers(regulatoryZonesChecked)}
        isShown={regulatoryZonesChecked?.length}
      >
        {
          numberOfRegulatoryLayersSaved
            ? `${numberOfRegulatoryLayersSaved} zones ajoutées`
            : `Ajouter ${regulatoryZonesChecked.length} zone${regulatoryZonesChecked.length > 1 ? 's' : ''}`
        }
      </AddRegulatoryLayer>
    </Search>
  )
}

const Search = styled.div`
  width: 350px;
`

const AddRegulatoryLayer = styled.div`
  cursor: pointer;
  border-radius: 0;
  font-size: 13px;
  background: ${COLORS.charcoal};
  color: ${p => p.theme.color.gainsboro};
  padding: 0;
  line-height: 2.5em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  height: ${props => props.isShown ? '36' : '0'}px;
  max-height: 600px;
  transition: 0.5s all;
`

export default RegulatoryLayerSearch
