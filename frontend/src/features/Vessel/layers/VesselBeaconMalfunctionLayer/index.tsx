import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_BEACON_MALFUNCTION_LAYER } from '@features/Vessel/layers/VesselBeaconMalfunctionLayer/constants'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselBeaconMalfunctionLayer() {
  const isSuperUser = useIsSuperUser()
  useMapLayer(VESSEL_BEACON_MALFUNCTION_LAYER, isSuperUser)

  return null
}
