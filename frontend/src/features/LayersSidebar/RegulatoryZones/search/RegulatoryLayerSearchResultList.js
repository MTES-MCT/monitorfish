import { useMemo } from 'react'
import styled from 'styled-components'
import RegulatoryLayerSearchResultLawType from './RegulatoryLayerSearchResultLawType'
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
  const hasOneLayerTypeOpen = useMemo(() => layersSidebarOpenedLayerType !== undefined, [layersSidebarOpenedLayerType])
  const hasSearchResults = useMemo(() => regulatoryLayersSearchResult && Object.keys(regulatoryLayersSearchResult).length > 0, [regulatoryLayersSearchResult])

  return (<>
    {
      hasOneLayerTypeOpen && hasSearchResults && <ShowResultList
        data-cy={'regulatory-search-show-results'}
        onClick={() => dispatch(setLayersSideBarOpenedLayerType(undefined))}
      >
        Afficher les résultats
      </ShowResultList>
    }
    {
      !hasOneLayerTypeOpen && <List $advancedSearchIsOpen={advancedSearchIsOpen}>
        {
          hasSearchResults
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
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
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
  background: ${p => p.theme.color.white};
  border-radius: 0;
  padding: 0;
  max-height: ${props => props.$advancedSearchIsOpen ? '52vh' : '74vh'};
  overflow-y: auto;
  overflow-x: hidden;
  color: ${p => p.theme.color.slateGray};
  transition: 0.5s all;
`

export default RegulatoryLayerSearchResultList
