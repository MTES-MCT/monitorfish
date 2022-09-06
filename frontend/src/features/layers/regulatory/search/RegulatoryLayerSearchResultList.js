import React, { useMemo } from 'react'
import styled from 'styled-components'
import RegulatoryLayerSearchResultLawType from './RegulatoryLayerSearchResultLawType'
import { COLORS } from '../../../../constants/constants'
import { useDispatch, useSelector } from 'react-redux'
import layer from '../../../../domain/shared_slices/Layer'

const RegulatoryLayerSearchResultList = ({ namespace }) => {
  const dispatch = useDispatch()
  const { setLayersSideBarOpenedLayerType } = layer[namespace].actions
  const {
    regulatoryLayersSearchResult,
    advancedSearchIsOpen
  } = useSelector(state => state.regulatoryLayerSearch)
  const layersSidebarOpenedLayerType = useSelector(state => state.layer.layersSidebarOpenedLayerType)
  const hasOneLayerTypeOpen = useMemo(() => layersSidebarOpenedLayerType !== '', [layersSidebarOpenedLayerType])

  return (<>
    {
      hasOneLayerTypeOpen
        ? <ShowResultList
          data-cy={'regulatory-search-show-results'}
          onClick={() => dispatch(setLayersSideBarOpenedLayerType(''))}
        >
          Afficher les résultats
      </ShowResultList>
        : <List $advancedSearchIsOpen={advancedSearchIsOpen}>
        {
          regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0
            ? Object.entries(regulatoryLayersSearchResult)?.map(([lawType, topic]) => {
              return (
                <RegulatoryLayerSearchResultLawType
                  key={lawType}
                  regulatoryLayerLawType={lawType}
                  topic={topic}
                />
              )
            })
            : null
        }
      </List>
    }
  </>)
}

const ShowResultList = styled.div`
  cursor: pointer;
  background: ${COLORS.charcoal};
  color: ${COLORS.gray};
  padding: 0;
  line-height: 2.5em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  height: 36px;
  transition: 0.5s all;
`

const List = styled.ul`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  max-height: ${props => props.$advancedSearchIsOpen ? '52vh' : '74vh'};
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.slateGray};
  transition: 0.5s all;
`

export default RegulatoryLayerSearchResultList
