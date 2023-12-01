import { logSoftError } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { RegulatoryLayerSearchInput } from './RegulatoryLayerSearchInput'
import { RegulatoryLayerSearchResultList } from './RegulatoryLayerSearchResultList'
import { resetRegulatoryZonesChecked, setRegulatoryLayersSearchResult } from './slice'
import layer from '../../../../../domain/shared_slices/Layer'
import { useEscapeFromKeyboard } from '../../../../../hooks/useEscapeFromKeyboard'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import {
  addRegulatoryZonesToMyLayers,
  closeRegulatoryZoneMetadataPanel,
  resetRegulatoryGeometriesToPreview
} from '../../../slice'

import type { LayerSliceNamespace } from '../../../../../domain/entities/layers/types'
import type { Promisable } from 'type-fest'

export type RegulatoryLayerSearchProps = {
  namespace: LayerSliceNamespace
  numberOfRegulatoryLayersSaved: number
  setNumberOfRegulatoryLayersSaved: (length: number) => Promisable<void>
}
export function RegulatoryLayerSearch({
  namespace,
  numberOfRegulatoryLayersSaved,
  setNumberOfRegulatoryLayersSaved
}: RegulatoryLayerSearchProps) {
  const dispatch = useMainAppDispatch()
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions
  const { layersSidebarOpenedLayerType } = useMainAppSelector(state => state.layer)
  const { regulatoryLayersSearchResult, regulatoryZonesChecked } = useMainAppSelector(
    state => state.regulatoryLayerSearch
  )

  const escape = useEscapeFromKeyboard()
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!layersSidebarOpenedLayerType) {
      return
    }

    dispatch(resetRegulatoryGeometriesToPreview())
    dispatch(resetRegulatoryZonesChecked())
    // dispatch(setRegulatoryLayersSearchResult(null))
  }, [dispatch, layersSidebarOpenedLayerType])

  useEffect(() => {
    if (!escape) {
      return
    }

    dispatch(resetRegulatoryGeometriesToPreview())
    dispatch(setRegulatoryLayersSearchResult(undefined))
    dispatch(resetRegulatoryZonesChecked())
    dispatch(closeRegulatoryZoneMetadataPanel())
  }, [dispatch, escape])

  useEffect(() => {
    if (!setLayersSideBarOpenedLayerType) {
      logSoftError({
        message: '`setLayersSideBarOpenedLayerType` is undefined.'
      })

      return
    }

    if (regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0) {
      dispatch(setLayersSideBarOpenedLayerType(undefined))
    }
  }, [dispatch, setLayersSideBarOpenedLayerType, regulatoryLayersSearchResult])

  function saveRegulatoryLayers(_regulatoryZonesChecked) {
    setNumberOfRegulatoryLayersSaved(_regulatoryZonesChecked.length)
    setTimeout(() => {
      setNumberOfRegulatoryLayersSaved(0)
    }, 2000)

    dispatch(addRegulatoryZonesToMyLayers(_regulatoryZonesChecked))
    dispatch(resetRegulatoryZonesChecked())
  }

  return (
    <Search ref={wrapperRef}>
      <RegulatoryLayerSearchInput />
      <RegulatoryLayerSearchResultList namespace={namespace} />
      {/* TODO Use monitor-ui `<Button />` here. */}
      <AddRegulatoryLayer
        $isShown={!!regulatoryZonesChecked?.length}
        data-cy="regulatory-search-add-zones-button"
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

const AddRegulatoryLayer = styled.div<{
  $isShown: boolean
}>`
  cursor: pointer;
  border-radius: 0;
  font-size: 13px;
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  padding: 0;
  line-height: 2.5em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  height: ${p => (p.$isShown ? '36' : '0')}px;
  max-height: 600px;
  text-align: center;
  transition: 0.5s all;
`
