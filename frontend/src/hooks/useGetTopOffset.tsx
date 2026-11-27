import { selectDisplayedHealthcheckTextWarning } from '@features/Healthcheck/selectors'
import { POSITION_REPLAY_BANNER_HEIGHT } from '@features/PositionReplay/constants'
import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'
import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { countVesselListFilter } from '@features/Vessel/components/VesselList/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { isEqual } from 'lodash-es'

const HEADBAND_HEIGHT = 50

/** Height of the headbands stacked on top of the map: healthcheck, vessel filters, then position replay. */
export function useGetTopOffset({ isPositionReplayBannerExcluded = false } = {}) {
  const healthcheckTextWarning = useMainAppSelector(selectDisplayedHealthcheckTextWarning)
  const listFilterValues = useMainAppSelector(state => state.vessel.listFilterValues)
  const isPositionReplayActive = useMainAppSelector(selectIsPositionReplayActive)
  const numberOfFilters = countVesselListFilter(listFilterValues)

  const areListFilterValuesEqualToDefaultOnes =
    isEqual(listFilterValues, DEFAULT_VESSEL_LIST_FILTER_VALUES) || numberOfFilters === 0

  const healthcheckOffset = healthcheckTextWarning.length ? HEADBAND_HEIGHT : 0
  const vesselFiltersOffset = areListFilterValuesEqualToDefaultOnes ? 0 : HEADBAND_HEIGHT
  const positionReplayOffset =
    isPositionReplayActive && !isPositionReplayBannerExcluded ? POSITION_REPLAY_BANNER_HEIGHT : 0

  return healthcheckOffset + vesselFiltersOffset + positionReplayOffset
}
