import { vesselSelectors } from '@features/Vessel/slice'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { getOnlyVesselIdentityProperties } from 'domain/entities/vessel/vessel'
import { useMemo } from 'react'

import { VesselSearch, type VesselSearchProps } from '.'

export function VesselSearchWithMapVessels(props: Omit<VesselSearchProps, 'mapVesselIdentities'>) {
  const mapVesselsAsEnhancedLastPositionWebGLObjects = useMainAppSelector(state =>
    vesselSelectors.selectAll(state.vessel.vessels)
  )

  const mapVesselIdentities = useMemo(
    () => mapVesselsAsEnhancedLastPositionWebGLObjects.map(getOnlyVesselIdentityProperties),
    [mapVesselsAsEnhancedLastPositionWebGLObjects]
  )

  /* eslint-disable react/jsx-props-no-spreading */
  return <VesselSearch mapVesselIdentities={mapVesselIdentities} {...props} />
}
