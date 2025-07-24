import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import {
  DEFAULT_VESSEL_LIST_FILTER_VALUES,
  LAST_CONTROL_PERIOD_LABEL,
  LAST_POSITION_AS_OPTIONS,
  LastControlPeriod,
  RISK_FACTOR_AS_OPTIONS,
  VESSEL_EMIT_POSITIONS_LABEL,
  VESSEL_LOCATION_LABEL,
  VESSEL_SIZE_LABEL,
  VesselSize
} from '@features/Vessel/components/VesselList/constants'
import { vesselListActions } from '@features/Vessel/components/VesselList/slice'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { getSelectedOptionFromOptionValueInTree, Icon, SingleTag } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash-es'
import styled from 'styled-components'

import type { VesselListFilter } from './types'

type FilterTagsProps = {
  areMoreFiltersDisplayable?: boolean
  className?: string
  isReadOnly?: boolean
  listFilterValues: VesselListFilter
  onFilter?: (nextListFilterValues: VesselListFilter) => void
  onReset?: () => void
}
export function FilterTags({
  areMoreFiltersDisplayable = false,
  className,
  isReadOnly = false,
  listFilterValues,
  onFilter,
  onReset
}: FilterTagsProps) {
  const areFiltersDisplayed = useMainAppSelector(store => store.vesselList.areFiltersDisplayed)
  const dispatch = useMainAppDispatch()

  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()

  const areListFilterValuesEqualToDefaultOnes = isEqual(listFilterValues, DEFAULT_VESSEL_LIST_FILTER_VALUES)

  const remove = (key: keyof VesselListFilter, value: Object | boolean | string | number) => {
    const filterValue = listFilterValues[key]

    if (!filterValue) {
      throw new Error('`filterValue` is undefined.')
    }

    const nextFilterValue = Array.isArray(filterValue) ? filterValue.filter(v => !isEqual(v, value)) : undefined
    const normalizedNextFilterValue = Array.isArray(nextFilterValue) && !nextFilterValue.length ? [] : nextFilterValue
    const nextListFilterValues = { ...listFilterValues, [key]: normalizedNextFilterValue }

    onFilter?.(nextListFilterValues)
  }

  return (
    <>
      <Row $isReadOnly={isReadOnly} className={className}>
        {!!listFilterValues.countryCodes &&
          listFilterValues.countryCodes.map(countryCode => (
            <SingleTag key={`countryCodes-${countryCode}`} onDelete={() => remove('countryCodes', countryCode)}>
              {String(COUNTRIES_AS_ALPHA2_OPTIONS.find(option => option.value === countryCode)?.label)}
            </SingleTag>
          ))}

        {!!listFilterValues.riskFactors &&
          listFilterValues.riskFactors.map(riskFactor => (
            <SingleTag key={`riskFactors-${riskFactor}`} onDelete={() => remove('riskFactors', riskFactor)}>
              {String(RISK_FACTOR_AS_OPTIONS.find(option => option.value === riskFactor)?.label)}
            </SingleTag>
          ))}

        {!!listFilterValues.fleetSegments &&
          listFilterValues.fleetSegments.map(fleetSegment => (
            <SingleTag key={`fleetSegments-${fleetSegment}`} onDelete={() => remove('fleetSegments', fleetSegment)}>
              {String(`Segment ${fleetSegment}`)}
            </SingleTag>
          ))}

        {!!listFilterValues.gearCodes &&
          !!gearsAsTreeOptions &&
          listFilterValues.gearCodes.map(gearCode => (
            <SingleTag key={`gearCodes-${gearCode}`} onDelete={() => remove('gearCodes', gearCode)}>
              {getSelectedOptionFromOptionValueInTree(gearsAsTreeOptions, gearCode)?.label}
            </SingleTag>
          ))}

        {!!listFilterValues.specyCodes &&
          !!speciesAsOptions &&
          listFilterValues.specyCodes.map(specyCode => (
            <SingleTag key={`specyCodes-${specyCode}`} onDelete={() => remove('specyCodes', specyCode)}>
              {String(speciesAsOptions.find(option => option.value.code === specyCode)?.label)}
            </SingleTag>
          ))}

        {!!listFilterValues.lastLandingPortLocodes &&
          !!portsAsTreeOptions &&
          listFilterValues.lastLandingPortLocodes.map(port => (
            <SingleTag key={`portLocodes-${port}`} onDelete={() => remove('lastLandingPortLocodes', port)}>
              {String(`Dernière débarque à ${getSelectedOptionFromOptionValueInTree(portsAsTreeOptions, port)?.label}`)}
            </SingleTag>
          ))}

        {!!listFilterValues.producerOrganizations &&
          listFilterValues.producerOrganizations.map(producerOrganization => (
            <SingleTag
              key={`producerOrganizations-${producerOrganization}`}
              onDelete={() => remove('producerOrganizations', producerOrganization)}
            >
              {String(`Membre de ${producerOrganization} (OP)`)}
            </SingleTag>
          ))}

        {!!listFilterValues.lastControlPeriod && (
          <SingleTag
            key={`lastControlPeriod-${listFilterValues.lastControlPeriod}`}
            onDelete={() => remove('lastControlPeriod', listFilterValues.lastControlPeriod as LastControlPeriod)}
          >
            {LAST_CONTROL_PERIOD_LABEL[listFilterValues.lastControlPeriod]}
          </SingleTag>
        )}

        {!!listFilterValues.districtCodes &&
          listFilterValues.districtCodes.map(districtCode => (
            <SingleTag key={`districtCode-${districtCode}`} onDelete={() => remove('districtCodes', districtCode)}>
              {String(`Quartier "${districtCode}"`)}
            </SingleTag>
          ))}

        {!!listFilterValues.vesselSize && (
          <SingleTag
            key={`vesselSize-${listFilterValues.vesselSize}`}
            onDelete={() => remove('vesselSize', listFilterValues.vesselSize as VesselSize)}
          >
            {String(VESSEL_SIZE_LABEL[listFilterValues.vesselSize])}
          </SingleTag>
        )}

        {!!listFilterValues.vesselsLocation &&
          listFilterValues.vesselsLocation.map(location => (
            <SingleTag key={`vesselsLocation-${location}`} onDelete={() => remove('vesselsLocation', location)}>
              {String(VESSEL_LOCATION_LABEL[location])}
            </SingleTag>
          ))}

        {!!listFilterValues.emitsPositions &&
          listFilterValues.emitsPositions.map(hasPosition => (
            <SingleTag key={`emitsPositions-${hasPosition}`} onDelete={() => remove('emitsPositions', hasPosition)}>
              {String(VESSEL_EMIT_POSITIONS_LABEL[hasPosition])}
            </SingleTag>
          ))}

        {listFilterValues.lastPositionHoursAgo !== undefined && (
          <SingleTag onDelete={() => remove('lastPositionHoursAgo', listFilterValues.lastPositionHoursAgo as number)}>
            {String(
              LAST_POSITION_AS_OPTIONS.find(hoursAgo => hoursAgo.value === listFilterValues.lastPositionHoursAgo)?.label
            )}
          </SingleTag>
        )}

        {listFilterValues.hasLogbook !== undefined &&
          (listFilterValues.hasLogbook ? (
            <SingleTag onDelete={() => remove('hasLogbook', true)}>Equipé JPE</SingleTag>
          ) : (
            <SingleTag onDelete={() => remove('hasLogbook', false)}>Non Equipé JPE</SingleTag>
          ))}

        {listFilterValues.zones !== undefined &&
          listFilterValues.zones.map(zone => (
            <SingleTag key={`zones-${zone.value}`} onDelete={() => remove('zones', zone)}>
              {zone.label}
            </SingleTag>
          ))}

        {!isReadOnly && !areListFilterValuesEqualToDefaultOnes && (
          <StyledLink>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link data-cy="vessel-list-reset-filters" onClick={() => onReset?.()}>
              <Icon.Reset size={14} /> Réinitialiser les filtres
            </Link>
          </StyledLink>
        )}

        {!isReadOnly && areMoreFiltersDisplayable && areFiltersDisplayed && (
          <StyledLink>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link
              data-cy="vessel-list-hide-filters"
              onClick={() => {
                dispatch(vesselListActions.setAreFiltersDisplayed(false))
              }}
            >
              <Icon.Hide size={14} /> Masquer les filtres
            </Link>
          </StyledLink>
        )}
        {!isReadOnly && areMoreFiltersDisplayable && !areFiltersDisplayed && (
          <StyledLink>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link
              data-cy="vessel-list-show-filters"
              onClick={() => {
                dispatch(vesselListActions.setAreFiltersDisplayed(true))
              }}
            >
              <Icon.Display size={14} /> Afficher les filtres
            </Link>
          </StyledLink>
        )}
      </Row>
    </>
  )
}

const StyledLink = styled.div`
  height: 24px;
  margin-right: 8px;
  margin-left: 8px;

  .Element-IconBox {
    margin-right: 4px;
  }
`

const Row = styled.div<{
  $isReadOnly: boolean
}>`
  align-items: center;
  display: flex;
  flex-wrap: wrap;

  > .Component-SingleTag {
    margin: 0 8px 8px 0;

    button {
      visibility: ${p => (p.$isReadOnly ? 'hidden' : 'visible')};
      ${p => {
        if (p.$isReadOnly) {
          return `
            width: 0;
            padding: 0;
            margin: 0;
          `
        }

        return undefined
      }}
    }
  }
`

const Link = styled.a`
  align-items: center;
  color: ${p => p.theme.color.charcoal};
  cursor: pointer;
  line-height: 1;
  text-decoration: underline;
`
