import { vesselSelectors } from '@features/Vessel/slice'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'

import { VesselSearch, type VesselSearchProps } from '.'
import { extractVesselIdentityProps } from '../../utils'

export function VesselSearchWithMapVessels(
  props: Readonly<Omit<VesselSearchProps, 'vesselIdentitiesFromLastPositions'>>
) {
  const mapVesselsAsEnhancedLastPositionWebGLObjects = useMainAppSelector(state =>
    vesselSelectors.selectAll(state.vessel.vessels)
  )

  const vesselIdentitiesFromLastPositions = useMemo(
    () => mapVesselsAsEnhancedLastPositionWebGLObjects.map(extractVesselIdentityProps),
    [mapVesselsAsEnhancedLastPositionWebGLObjects]
  )

  /* eslint-disable react/jsx-props-no-spreading */
  return <VesselSearch vesselIdentitiesFromLastPositions={vesselIdentitiesFromLastPositions} {...props} />
}
