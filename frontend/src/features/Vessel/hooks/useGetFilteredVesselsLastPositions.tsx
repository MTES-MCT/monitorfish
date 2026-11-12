import { selectFilteredVesselFeatureIdsSet, vesselSelectors } from '@features/Vessel/slice'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'

export function useGetFilteredVesselsLastPositions(): Vessel.ActiveVessel[] {
  const vessels = useMainAppSelector(state => vesselSelectors.selectAll(state.vessel.vessels))
  const filteredVesselFeatureIds = useMainAppSelector(selectFilteredVesselFeatureIdsSet)

  return useMemo(
    () => vessels.filter(vessel => filteredVesselFeatureIds.has(vessel.vesselFeatureId)),
    [vessels, filteredVesselFeatureIds]
  )
}
