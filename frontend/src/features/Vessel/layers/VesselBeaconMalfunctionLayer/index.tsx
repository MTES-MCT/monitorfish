import { VESSEL_BEACON_MALFUNCTION_LAYER } from '@features/Vessel/layers/VesselBeaconMalfunctionLayer/constants'
import { useEffect } from 'react'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { monitorfishMap } from '../../../Map/monitorfishMap'

export function VesselBeaconMalfunctionLayer() {
  const isSuperUser = useIsSuperUser()

  useEffect(() => {
    if (isSuperUser) {
      monitorfishMap.getLayers().push(VESSEL_BEACON_MALFUNCTION_LAYER)
    }

    return () => {
      monitorfishMap.removeLayer(VESSEL_BEACON_MALFUNCTION_LAYER)
    }
  }, [isSuperUser])

  return null
}
