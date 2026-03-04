import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER } from '@features/Vessel/layers/VesselAlertAndBeaconMalfunctionLayer/constants'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselAlertAndBeaconMalfunctionLayer() {
  const isSuperUser = useIsSuperUser()
  useMapLayer(VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER, isSuperUser)

  return null
}
