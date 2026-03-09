import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_ALERT_LAYER } from '@features/Vessel/layers/VesselAlertLayer/constants'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselAlertLayer() {
  const isSuperUser = useIsSuperUser()
  useMapLayer(VESSEL_ALERT_LAYER, isSuperUser)

  return null
}
