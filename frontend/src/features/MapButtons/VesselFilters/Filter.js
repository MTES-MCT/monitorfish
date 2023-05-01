import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { ReactComponent as ShowIconSVG } from '../../icons/oeil_affiche.svg'
import { ReactComponent as HideIconSVG } from '../../icons/oeil_masque.svg'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import { ReactComponent as FilterSVG } from '../../icons/Icone_filtres_dark.svg'
import TagList from './TagList'

const Filter = ({ filter, index, isLastItem, removeFilter, showFilter, hideFilters, removeTagFromFilter }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FilterWrapper>
      <FilterItem isLastItem={isLastItem} isOpen={isOpen}>
        <Text
          data-cy={'vessel-filter'}
          title={filter.name.replace(/[_]/g, ' ')}
          onClick={() => setIsOpen(!isOpen)}>
          <ChevronIcon $isOpen={isOpen}/>
          <FilterIcon fill={filter.color}/>
          {filter.name
            ? filter.name.replace(/[_]/g, ' ')
            : `Filtre n°${index}`
          }
        </Text>
        {
          filter.showed
            ? <ShowIcon title="Cacher le filtre" onClick={() => hideFilters()}/>
            : <HideIcon title="Afficher le filtre" onClick={() => showFilter(filter.uuid)}/>
        }
        <CloseIcon title="Supprimer le filtre de ma sélection" onClick={() => removeFilter(filter.uuid)}/>
      </FilterItem>
      <FilterTags isOpen={isOpen} isLastItem={isLastItem}>
        <TagList
          uuid={filter.uuid}
          filters={filter.filters}
          removeTagFromFilter={removeTagFromFilter}
        />
      </FilterTags>
    </FilterWrapper>
  )
}

const FilterTags = styled.div`
  padding: ${props => props.isOpen ? '15px 15px 5px 15px' : '0'};
  height: ${props => props.isOpen ? 'inherit' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  ${props => props.isOpen && !props.isLastItem ? `border-bottom: 1px solid ${COLORS.lightGray};` : null}
  transition: all 0.3s;
`

const FilterIcon = styled(FilterSVG)`
  width: 18px;
  margin-bottom: -6px;
  margin-right: 5px;
`

const Text = styled.span`
  line-height: 2.7em;
  font-size: 13px;
  padding-left: 10px;
  width: 79%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${COLORS.gunMetal};
  font-weight: 500;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  padding-top: 2px;
  margin-right: 10px;
`

const ShowIcon = styled(ShowIconSVG)`
  width: 23px;
  padding: 0 8px 0 0;
  margin-top: 9px;
  margin-left: 6px;
`

const HideIcon = styled(HideIconSVG)`
  width: 23px;
  padding: 0 8px 0 0;
  margin-top: 9px;
  margin-left: 6px;
`

const FilterItem = styled.span`
  width: 100%;
  display: flex;
  user-select: none;
  ${props => (!props.isOpen && props.isLastItem) ? null : `border-bottom: 1px solid ${COLORS.lightGray};`}
  cursor: pointer;
`

const FilterWrapper = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  margin: 0;
  line-height: 1.9em;
  display: block;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 16px;
  margin-right: 8px;
  margin-top: 5px;

  animation: ${props => props.$isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default Filter
