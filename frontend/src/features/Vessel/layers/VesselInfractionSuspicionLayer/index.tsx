import { VESSEL_INFRACTION_SUSPICION_LAYER } from '@features/Vessel/layers/VesselInfractionSuspicionLayer/constants'
import { useEffect } from 'react'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { monitorfishMap } from '../../../Map/monitorfishMap'

export function VesselInfractionSuspicionLayer() {
  const isSuperUser = useIsSuperUser()

  useEffect(() => {
    if (isSuperUser) {
      monitorfishMap.getLayers().push(VESSEL_INFRACTION_SUSPICION_LAYER)
    }

    return () => {
      monitorfishMap.removeLayer(VESSEL_INFRACTION_SUSPICION_LAYER)
    }
  }, [isSuperUser])

  return null
}
