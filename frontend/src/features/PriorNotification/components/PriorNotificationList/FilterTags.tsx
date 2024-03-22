import { COUNTRIES_AS_ALPHA3_OPTIONS } from '@constants/index'
import { useGetPriorNotificationTypesAsOptions } from '@features/PriorNotification/hooks/useGetPriorNotificationTypesAsOptions'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { useGetFleetSegmentsAsOptions } from '@hooks/useGetFleetSegmentsAsOptions'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { SingleTag, getSelectedOptionFromOptionValueInTree } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { ListFilter } from './types'

export function FilterTags() {
  const listFilterValues = useMainAppSelector(store => store.priorNotification.listFilterValues)
  const dispatch = useMainAppDispatch()

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const { priorNotificationTypesAsOptions } = useGetPriorNotificationTypesAsOptions()

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

  const removeAll = () => {
    dispatch(priorNotificationActions.resetListFilterValues())
  }

  return (
    <Wrapper>
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
              {String(speciesAsOptions.find(option => option.value === specyCode)?.label)}
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
      </Row>

      <Row>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link onClick={removeAll}>Réinitialiser les filtres</Link>
      </Row>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin-bottom: 24px;

  > div:not(:first-child) {
    margin-top: 12px;
  }
`

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;

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
