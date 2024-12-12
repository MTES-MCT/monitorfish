import { layerActions } from '@features/Map/layer.slice'
import { useEscapeFromKeyboard } from '@hooks/useEscapeFromKeyboard'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { ResultList } from './ResultList'
import { SearchInput } from './SearchInput'
import { setRegulatoryLayersSearchResult } from './slice'
import { regulationActions } from '../../slice'

export function RegulationSearch() {
  const dispatch = useMainAppDispatch()
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)
  const regulatoryLayersSearchResult = useMainAppSelector(
    state => state.regulatoryLayerSearch.regulatoryLayersSearchResult
  )

  const escape = useEscapeFromKeyboard()
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!layersSidebarOpenedLayerType) {
      return
    }

    dispatch(regulationActions.resetRegulatoryGeometriesToPreview())
  }, [dispatch, layersSidebarOpenedLayerType])

  useEffect(() => {
    if (!escape) {
      return
    }

    dispatch(regulationActions.resetRegulatoryGeometriesToPreview())
    dispatch(setRegulatoryLayersSearchResult(undefined))
    dispatch(regulationActions.closeRegulatoryZoneMetadataPanel())
  }, [dispatch, escape])

  useEffect(() => {
    if (regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0) {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
    }
  }, [dispatch, regulatoryLayersSearchResult])

  return (
    <Search ref={wrapperRef}>
      <SearchInput />
      <ResultList />
    </Search>
  )
}

const Search = styled.div`
  width: 350px;
`
