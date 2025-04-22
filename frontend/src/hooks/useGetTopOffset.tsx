import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { countVesselListFilter } from '@features/Vessel/components/VesselList/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { isEqual } from 'lodash-es'

export function useGetTopOffset() {
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const listFilterValues = useMainAppSelector(state => state.vessel.listFilterValues)
  const numberOfFilters = countVesselListFilter(listFilterValues)

  const areListFilterValuesEqualToDefaultOnes =
    isEqual(listFilterValues, DEFAULT_VESSEL_LIST_FILTER_VALUES) || numberOfFilters === 0

  return (function () {
    if (!!healthcheckTextWarning.length && !areListFilterValuesEqualToDefaultOnes) {
      return 100
    }

    if (healthcheckTextWarning.length) {
      return 50
    }

    if (!areListFilterValuesEqualToDefaultOnes) {
      return 50
    }

    return 0
  })()
}
