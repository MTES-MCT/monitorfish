import { vesselSelectors } from '@features/Vessel/slice'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'

import { VesselSearch, type VesselSearchProps } from '.'
import { extractVesselIdentityProps } from '../../utils'

export function VesselSearchWithMapVessels(props: Readonly<Omit<VesselSearchProps, 'vmsVessels'>>) {
  const mapVessels = useMainAppSelector(state => vesselSelectors.selectAll(state.vessel.vessels))

  const vmsVessels = useMemo(() => mapVessels.map(extractVesselIdentityProps), [mapVessels])

  /* eslint-disable react/jsx-props-no-spreading */
  return <VesselSearch vmsVessels={vmsVessels} {...props} />
}
