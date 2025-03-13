import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import {
  DEFAULT_VESSEL_LIST_FILTER_VALUES,
  LAST_CONTROL_PERIOD_LABEL,
  LAST_POSITION_AS_OPTIONS,
  LastControlPeriod,
  RISK_FACTOR_AS_OPTIONS,
  VESSEL_LOCATION_LABEL,
  VESSEL_SIZE_LABEL,
  VesselSize
} from '@features/Vessel/components/VesselListV2/constants'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { getSelectedOptionFromOptionValueInTree, Icon, SingleTag } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash-es'
import styled from 'styled-components'

import type { VesselListFilter } from './types'

export function FilterTags() {
  const listFilterValues: VesselListFilter = useMainAppSelector(store => store.vessel.listFilterValues)
  const dispatch = useMainAppDispatch()

  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()

  const hasTags =
    !!listFilterValues.countryCodes ||
    !!listFilterValues.fleetSegments ||
    !!listFilterValues.specyCodes ||
    !!listFilterValues.gearCodes ||
    !!listFilterValues.lastLandingPortLocodes ||
    !!listFilterValues.lastPositionHoursAgo ||
    !!listFilterValues.vesselsLocation ||
    !!listFilterValues.vesselSize ||
    !!listFilterValues.producerOrganizations ||
    listFilterValues.hasLogbook !== undefined ||
    !!listFilterValues.riskFactors

  const areListFilterValuesEqualToDefaultOnes = isEqual(listFilterValues, DEFAULT_VESSEL_LIST_FILTER_VALUES)

  const remove = (key: keyof VesselListFilter, value: boolean | string | number) => {
    const filterValue = listFilterValues[key]

    if (!filterValue) {
      throw new Error('`filterValue` is undefined.')
    }

    const nextFilterValue = Array.isArray(filterValue) ? filterValue.filter(v => v !== value) : undefined
    const normalizedNextFilterValue =
      Array.isArray(nextFilterValue) && !nextFilterValue.length ? undefined : nextFilterValue
    const nextListFilterValues = { ...listFilterValues, [key]: normalizedNextFilterValue }

    dispatch(filterVessels(nextListFilterValues))
  }

  const reset = () => {
    dispatch(filterVessels(DEFAULT_VESSEL_LIST_FILTER_VALUES))
  }

  return (
    <>
      {hasTags && (
        <Row className="vessel-list-filter-tags">
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
                {String(
                  `Dernière débarque à ${getSelectedOptionFromOptionValueInTree(portsAsTreeOptions, port)?.label}`
                )}
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

          {listFilterValues.lastPositionHoursAgo !== undefined && (
            <SingleTag onDelete={() => remove('lastPositionHoursAgo', listFilterValues.lastPositionHoursAgo as number)}>
              {String(
                LAST_POSITION_AS_OPTIONS.find(hoursAgo => hoursAgo.value === listFilterValues.lastPositionHoursAgo)
                  ?.label
              )}
            </SingleTag>
          )}

          {listFilterValues.hasLogbook !== undefined &&
            (listFilterValues.hasLogbook ? (
              <SingleTag onDelete={() => remove('hasLogbook', true)}>Equipé JPE</SingleTag>
            ) : (
              <SingleTag onDelete={() => remove('hasLogbook', false)}>Non Equipé JPE</SingleTag>
            ))}

          {!areListFilterValuesEqualToDefaultOnes && (
            <ResetFilters>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <Link data-cy="vessel-list-reset-filters" onClick={reset}>
                <Icon.Reset size={14} /> Réinitialiser les filtres
              </Link>
            </ResetFilters>
          )}
        </Row>
      )}
    </>
  )
}

const ResetFilters = styled.div`
  height: 24px;

  .Element-IconBox {
    margin-right: 4px;
  }
`

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
  margin-left: 16px;

  > .Component-SingleTag {
    margin: 0 8px 8px 0;
  }
`

const Link = styled.a`
  align-items: center;
  color: ${p => p.theme.color.charcoal};
  cursor: pointer;
  line-height: 1;
  text-decoration: underline;
`
