import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { countVesselListFilter } from '@features/Vessel/components/VesselList/utils'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Link, pluralize } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash-es'
import styled from 'styled-components'

export function VesselFiltersHeadband() {
  const dispatch = useMainAppDispatch()
  const listFilterValues = useMainAppSelector(state => state.vessel.listFilterValues)
  const numberOfFilters = countVesselListFilter(listFilterValues)

  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)

  const areListFilterValuesEqualToDefaultOnes = isEqual(listFilterValues, DEFAULT_VESSEL_LIST_FILTER_VALUES)
  const hasHealthcheckWarning = !!healthcheckTextWarning.length

  const reset = () => {
    dispatch(filterVessels(DEFAULT_VESSEL_LIST_FILTER_VALUES))
  }

  return (
    <>
      {!areListFilterValuesEqualToDefaultOnes && numberOfFilters > 0 && (
        <Wrapper $hasHealthcheckWarning={hasHealthcheckWarning}>
          {numberOfFilters} {pluralize('filtre', numberOfFilters)} {numberOfFilters > 1 ? 'sont' : 'est'}{' '}
          {pluralize('appliqué', numberOfFilters)} sur les navires affichés.
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}{' '}
          <StyledLink onClick={reset}>Réinitialiser les filtres</StyledLink>
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div<{
  $hasHealthcheckWarning: boolean
}>`
  z-index: 1045;
  position: absolute;
  top: ${p => (p.$hasHealthcheckWarning ? 50 : 0)}px;
  font-size: 16px;
  font-weight: 700;
  background: ${p => p.theme.color.charcoal};
  width: calc(100vw - 26px);
  height: 24px;
  text-align: center;
  padding: 13px;
  color: ${p => p.theme.color.gainsboro};
`

const StyledLink = styled(Link)`
  color: ${p => p.theme.color.gainsboro} !important;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
`
