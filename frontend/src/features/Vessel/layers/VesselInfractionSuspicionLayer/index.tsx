import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_INFRACTION_SUSPICION_LAYER } from '@features/Vessel/layers/VesselInfractionSuspicionLayer/constants'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselInfractionSuspicionLayer() {
  const isSuperUser = useIsSuperUser()
  useMapLayer(VESSEL_INFRACTION_SUSPICION_LAYER, isSuperUser)

  return null
}
