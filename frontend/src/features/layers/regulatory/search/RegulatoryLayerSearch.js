import React, { useEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import layer from '../../../../domain/shared_slices/Layer'
import {
  addRegulatoryZonesToMyLayers,
  closeRegulatoryZoneMetadataPanel,
  resetRegulatoryGeometriesToPreview,
} from '../../../../domain/shared_slices/Regulatory'
import { useEscapeFromKeyboard } from '../../../../hooks/useEscapeFromKeyboard'
import { resetRegulatoryZonesChecked, setRegulatoryLayersSearchResult } from './RegulatoryLayerSearch.slice'
import RegulatoryLayerSearchInput from './RegulatoryLayerSearchInput'
import RegulatoryLayerSearchResultList from './RegulatoryLayerSearchResultList'

function RegulatoryLayerSearch(props) {
  const { layersSidebarIsOpen, namespace, numberOfRegulatoryLayersSaved, setNumberOfRegulatoryLayersSaved } = props

  const dispatch = useDispatch()
  const { setLayersSideBarOpenedZone } = layer[namespace].actions
  const { layersSidebarOpenedLayer } = useSelector(state => state.layer)
  const { regulatoryLayersSearchResult, regulatoryZonesChecked } = useSelector(state => state.regulatoryLayerSearch)

  const [initSearchFields, setInitSearchFields] = useState(false)
  const escape = useEscapeFromKeyboard()
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (layersSidebarOpenedLayer !== '') {
      batch(() => {
        dispatch(resetRegulatoryGeometriesToPreview())
        dispatch(setRegulatoryLayersSearchResult(null))
        dispatch(resetRegulatoryZonesChecked())
      })
    }
  }, [layersSidebarOpenedLayer])

  useEffect(() => {
    if (initSearchFields) {
      dispatch(closeRegulatoryZoneMetadataPanel())
    }
  }, [initSearchFields])

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
      dispatch(setLayersSideBarOpenedZone(''))
    }
  }, [regulatoryLayersSearchResult])

  function saveRegulatoryLayers(_regulatoryZonesChecked) {
    setNumberOfRegulatoryLayersSaved(_regulatoryZonesChecked.length)
    setTimeout(() => {
      setNumberOfRegulatoryLayersSaved(0)
    }, 2000)
    batch(() => {
      dispatch(addRegulatoryZonesToMyLayers(_regulatoryZonesChecked))
      dispatch(resetRegulatoryZonesChecked())
    })
  }

  return (
    <Search ref={wrapperRef}>
      <RegulatoryLayerSearchInput
        initSearchFields={initSearchFields}
        layersSidebarIsOpen={layersSidebarIsOpen}
        setInitSearchFields={setInitSearchFields}
      />
      <RegulatoryLayerSearchResultList />
      <AddRegulatoryLayer
        data-cy="regulatory-search-add-zones-button"
        isShown={regulatoryZonesChecked?.length}
        onClick={() => saveRegulatoryLayers(regulatoryZonesChecked)}
      >
        {numberOfRegulatoryLayersSaved
          ? `${numberOfRegulatoryLayersSaved} zones ajoutées`
          : `Ajouter ${regulatoryZonesChecked.length} zone${regulatoryZonesChecked.length > 1 ? 's' : ''}`}
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
  color: ${COLORS.gray};
  padding: 0;
  line-height: 2.5em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  height: ${props => (props.isShown ? '36' : '0')}px;
  max-height: 600px;
  transition: 0.5s all;
`

export default RegulatoryLayerSearch
