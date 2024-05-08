import { useEscapeFromKeyboard } from '@hooks/useEscapeFromKeyboard'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Button, Icon, logSoftError, Size } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { ResultList } from './ResultList'
import { SearchInput } from './SearchInput'
import { resetRegulatoryZonesChecked, setRegulatoryLayersSearchResult } from './slice'
import layer from '../../../../domain/shared_slices/Layer'
import {
  addRegulatoryZonesToMyLayers,
  closeRegulatoryZoneMetadataPanel,
  resetRegulatoryGeometriesToPreview
} from '../../slice'

import type { LayerSliceNamespace } from '../../../../domain/entities/layers/types'
import type { Promisable } from 'type-fest'

export type RegulatoryLayerSearchProps = {
  namespace: LayerSliceNamespace
  numberOfRegulatoryLayersSaved: number
  setNumberOfRegulatoryLayersSaved: (length: number) => Promisable<void>
}
export function RegulationSearch({
  namespace,
  numberOfRegulatoryLayersSaved,
  setNumberOfRegulatoryLayersSaved
}: RegulatoryLayerSearchProps) {
  const dispatch = useMainAppDispatch()
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)
  const regulatoryLayersSearchResult = useMainAppSelector(
    state => state.regulatoryLayerSearch.regulatoryLayersSearchResult
  )
  const regulatoryZonesChecked = useMainAppSelector(state => state.regulatoryLayerSearch.regulatoryZonesChecked)

  const escape = useEscapeFromKeyboard()
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!layersSidebarOpenedLayerType) {
      return
    }

    dispatch(resetRegulatoryGeometriesToPreview())
    dispatch(resetRegulatoryZonesChecked())
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
      <SearchInput />
      <ResultList namespace={namespace} />
      <AddRegulatoryLayer
        $isShown={!!regulatoryZonesChecked?.length || !!numberOfRegulatoryLayersSaved}
        data-cy="regulatory-search-add-zones-button"
        Icon={regulatoryZonesChecked.length ? Icon.Save : undefined}
        isFullWidth
        onClick={() => saveRegulatoryLayers(regulatoryZonesChecked)}
        size={Size.LARGE}
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

const AddRegulatoryLayer = styled(Button)<{
  $isShown: boolean
}>`
  display: flex;
  opacity: ${p => (p.$isShown ? 1 : 0)};
  height: ${p => (p.$isShown ? '36' : '0')}px;
  padding: ${p => (p.$isShown ? 'inherit' : '0')}px;
  border: ${p => (p.$isShown ? 'inherit' : '0')}px;
  transition: 0.5s all;
  overflow: hidden;
`
