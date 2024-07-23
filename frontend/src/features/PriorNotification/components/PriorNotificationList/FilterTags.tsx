import { COUNTRIES_AS_ALPHA3_OPTIONS } from '@constants/index'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { useGetPriorNotificationTypesAsOptions } from '@features/PriorNotification/hooks/useGetPriorNotificationTypesAsOptions'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { SingleTag, getSelectedOptionFromOptionValueInTree } from '@mtes-mct/monitor-ui'
import { isEqual, omit } from 'lodash'
import styled from 'styled-components'

import { DEFAULT_LIST_FILTER_VALUES } from './constants'

import type { ListFilter } from './types'

export function FilterTags() {
  const listFilterValues = useMainAppSelector(store => store.priorNotification.listFilterValues)
  const dispatch = useMainAppDispatch()

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const { priorNotificationTypesAsOptions } = useGetPriorNotificationTypesAsOptions()

  const hasTags =
    !!listFilterValues.countryCodes ||
    !!listFilterValues.fleetSegmentSegments ||
    !!listFilterValues.specyCodes ||
    !!listFilterValues.gearCodes ||
    !!listFilterValues.portLocodes ||
    !!listFilterValues.priorNotificationTypes ||
    !!listFilterValues.states
  const areListFilterValuesEqualToDefaultOnes = isEqual(
    omit(listFilterValues, ['seafrontGroup']),
    omit(DEFAULT_LIST_FILTER_VALUES, ['seafrontGroup'])
  )

  const remove = (key: keyof ListFilter, value: string) => {
    const filterValue = listFilterValues[key]

    if (!filterValue) {
      throw new Error('`filterValue` is undefined.')
    }

    const nextFilterValue = Array.isArray(filterValue) ? filterValue.filter(v => v !== value) : undefined
    const normalizedNextFilterValue =
      Array.isArray(nextFilterValue) && !nextFilterValue.length ? undefined : nextFilterValue
    const nextListFilterValues = { ...listFilterValues, [key]: normalizedNextFilterValue }

    dispatch(priorNotificationActions.setListFilterValues(nextListFilterValues))
  }

  const reset = () => {
    dispatch(priorNotificationActions.resetListFilterValues())
  }

  return (
    <>
      {hasTags && (
        <Row>
          {!!listFilterValues.countryCodes &&
            listFilterValues.countryCodes.map(countryCode => (
              <SingleTag key={`countryCodes-${countryCode}`} onDelete={() => remove('countryCodes', countryCode)}>
                {String(COUNTRIES_AS_ALPHA3_OPTIONS.find(option => option.value === countryCode)?.label)}
              </SingleTag>
            ))}

          {!!listFilterValues.fleetSegmentSegments &&
            !!fleetSegmentsAsOptions &&
            listFilterValues.fleetSegmentSegments.map(fleetSegmentSegment => (
              <SingleTag
                key={`fleetSegmentSegments-${fleetSegmentSegment}`}
                onDelete={() => remove('fleetSegmentSegments', fleetSegmentSegment)}
              >
                {String(fleetSegmentsAsOptions.find(option => option.value === fleetSegmentSegment)?.label)}
              </SingleTag>
            ))}

          {!!listFilterValues.specyCodes &&
            !!speciesAsOptions &&
            listFilterValues.specyCodes.map(specyCode => (
              <SingleTag key={`specyCodes-${specyCode}`} onDelete={() => remove('specyCodes', specyCode)}>
                {String(speciesAsOptions.find(option => option.value.code === specyCode)?.label)}
              </SingleTag>
            ))}

          {!!listFilterValues.gearCodes &&
            !!gearsAsTreeOptions &&
            listFilterValues.gearCodes.map(gearCode => (
              <SingleTag key={`gearCodes-${gearCode}`} onDelete={() => remove('gearCodes', gearCode)}>
                {getSelectedOptionFromOptionValueInTree(gearsAsTreeOptions, gearCode)?.label}
              </SingleTag>
            ))}

          {!!listFilterValues.portLocodes &&
            !!portsAsTreeOptions &&
            listFilterValues.portLocodes.map(portLocode => (
              <SingleTag key={`portLocodes-${portLocode}`} onDelete={() => remove('portLocodes', portLocode)}>
                {getSelectedOptionFromOptionValueInTree(portsAsTreeOptions, portLocode)?.label}
              </SingleTag>
            ))}

          {!!listFilterValues.priorNotificationTypes &&
            !!priorNotificationTypesAsOptions &&
            listFilterValues.priorNotificationTypes.map(priorNotificationType => (
              <SingleTag
                key={`priorNotificationTypes-${priorNotificationType}`}
                onDelete={() => remove('priorNotificationTypes', priorNotificationType)}
              >
                {String(priorNotificationTypesAsOptions.find(option => option.value === priorNotificationType)?.label)}
              </SingleTag>
            ))}

          {listFilterValues.states?.map(state => (
            <SingleTag key={`states-${state}`} onDelete={() => remove('states', state)}>
              {PriorNotification.STATE_LABEL[state]}
            </SingleTag>
          ))}
        </Row>
      )}

      {!areListFilterValuesEqualToDefaultOnes && (
        <Row>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Link onClick={reset}>Réinitialiser les filtres</Link>
        </Row>
      )}
    </>
  )
}

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;

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
