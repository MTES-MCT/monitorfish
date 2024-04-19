import { COLORS } from '@constants/constants'
import { useState } from 'react'
import styled from 'styled-components'

import { TagList } from './TagList'
import ChevronIconSVG from '../../icons/Chevron_simple_gris.svg?react'
import CloseIconSVG from '../../icons/Croix_grise.svg?react'
import FilterSVG from '../../icons/Icone_filtres_dark.svg?react'
import ShowIconSVG from '../../icons/oeil_affiche.svg?react'
import HideIconSVG from '../../icons/oeil_masque.svg?react'

import type { VesselFilter } from 'domain/types/filter'

type FilterProps = Readonly<{
  filter: VesselFilter
  hideFilters: () => void
  index: number
  isLastItem: boolean
  removeFilter: (uuid: string) => void
  removeTagFromFilter: (removeObject: {
    type: string | undefined
    uuid: string | undefined
    value: number | string
  }) => void
  showFilter: (uuid: string) => void
}>
export function Filter({
  filter,
  hideFilters,
  index,
  isLastItem,
  removeFilter,
  removeTagFromFilter,
  showFilter
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FilterWrapper>
      <FilterItem $isLastItem={isLastItem} $isOpen={isOpen}>
        <Text data-cy="vessel-filter" onClick={() => setIsOpen(!isOpen)} title={filter.name.replace(/_/g, ' ')}>
          <ChevronIcon $isOpen={isOpen} />
          <FilterIcon fill={filter.color} />
          {filter.name ? filter.name.replace(/_/g, ' ') : `Filtre n°${index}`}
        </Text>
        {filter.showed ? (
          <ShowIcon onClick={() => hideFilters()} title="Cacher le filtre" />
        ) : (
          <HideIcon onClick={() => showFilter(filter.uuid)} title="Afficher le filtre" />
        )}
        <CloseIcon onClick={() => removeFilter(filter.uuid)} title="Supprimer le filtre de ma sélection" />
      </FilterItem>
      <FilterTags $isLastItem={isLastItem} $isOpen={isOpen}>
        <TagList filters={filter.filters} removeTagFromFilter={removeTagFromFilter} uuid={filter.uuid} />
      </FilterTags>
    </FilterWrapper>
  )
}

const FilterTags = styled.div<{
  $isLastItem: boolean
  $isOpen: boolean
}>`
  padding: ${props => (props.$isOpen ? '15px 15px 5px 15px' : '0')};
  height: ${props => (props.$isOpen ? 'inherit' : '0')};
  opacity: ${props => (props.$isOpen ? '1' : '0')};
  ${props => (props.$isOpen && !props.$isLastItem ? `border-bottom: 1px solid ${COLORS.lightGray};` : null)}
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

const FilterItem = styled.span<{
  $isLastItem: boolean
  $isOpen: boolean
}>`
  width: 100%;
  display: flex;
  user-select: none;
  ${props => (!props.$isOpen && props.$isLastItem ? null : `border-bottom: 1px solid ${COLORS.lightGray};`)}
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

const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  transform: rotate(180deg);
  width: 16px;
  margin-right: 8px;
  margin-top: 5px;

  animation: ${props => (props.$isOpen ? 'chevron-layer-opening' : 'chevron-layer-closing')} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes chevron-layer-closing {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(180deg);
    }
  }
`
