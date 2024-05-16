import { useEscapeFromKeyboard } from '@hooks/useEscapeFromKeyboard'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { logSoftError } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { ResultList } from './ResultList'
import { SearchInput } from './SearchInput'
import { setRegulatoryLayersSearchResult } from './slice'
import layer from '../../../../domain/shared_slices/Layer'
import { closeRegulatoryZoneMetadataPanel, resetRegulatoryGeometriesToPreview } from '../../slice'

import type { LayerSliceNamespace } from '../../../../domain/entities/layers/types'

export type RegulatoryLayerSearchProps = {
  namespace: LayerSliceNamespace
}
export function RegulationSearch({ namespace }: RegulatoryLayerSearchProps) {
  const dispatch = useMainAppDispatch()
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions
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

    dispatch(resetRegulatoryGeometriesToPreview())
  }, [dispatch, layersSidebarOpenedLayerType])

  useEffect(() => {
    if (!escape) {
      return
    }

    dispatch(resetRegulatoryGeometriesToPreview())
    dispatch(setRegulatoryLayersSearchResult(undefined))
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

  return (
    <Search ref={wrapperRef}>
      <SearchInput />
      <ResultList namespace={namespace} />
    </Search>
  )
}

const Search = styled.div`
  width: 350px;
`
