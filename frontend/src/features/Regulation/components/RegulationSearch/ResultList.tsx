import { layerActions } from '@features/Map/layer.slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Button, Size } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { ResultLawType } from './ResultLawType'

export function ResultList() {
  const dispatch = useMainAppDispatch()
  const advancedSearchIsOpen = useMainAppSelector(state => state.regulatoryLayerSearch.advancedSearchIsOpen)
  const regulatoryLayersSearchResult = useMainAppSelector(
    state => state.regulatoryLayerSearch.regulatoryLayersSearchResult
  )
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)
  const hasOneLayerTypeOpen = useMemo(() => layersSidebarOpenedLayerType !== undefined, [layersSidebarOpenedLayerType])
  const hasSearchResults = useMemo(
    () => regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0,
    [regulatoryLayersSearchResult]
  )

  return (
    <>
      {hasOneLayerTypeOpen && hasSearchResults && (
        <ShowResultButton
          isFullWidth
          onClick={() => {
            dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
          }}
          size={Size.LARGE}
        >
          Afficher les résultats de la recherche
        </ShowResultButton>
      )}
      {!hasOneLayerTypeOpen && (
        <List $advancedSearchIsOpen={advancedSearchIsOpen}>
          {hasSearchResults &&
            regulatoryLayersSearchResult &&
            Object.entries(regulatoryLayersSearchResult)?.map(([lawType, topic]) => (
              <ResultLawType key={lawType} regulatoryLayerLawType={lawType} topic={topic} />
            ))}
        </List>
      )}
    </>
  )
}

const ShowResultButton = styled(Button)`
  height: 36px;
`

const List = styled.ul<{
  $advancedSearchIsOpen: boolean
}>`
  margin: 0;
  background: ${p => p.theme.color.white};
  border-radius: 0;
  padding: 0;
  max-height: ${p => (p.$advancedSearchIsOpen ? '52vh' : '74vh')};
  overflow-y: auto;
  overflow-x: hidden;
  color: #ff3392;
  transition: 0.5s all;
`
