import { VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER } from '@features/Vessel/layers/VesselAlertAndBeaconMalfunctionLayer/constants'
import { useEffect } from 'react'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { monitorfishMap } from '../../../Map/monitorfishMap'

export function VesselAlertAndBeaconMalfunctionLayer() {
  const isSuperUser = useIsSuperUser()

  useEffect(() => {
    if (isSuperUser) {
      monitorfishMap.getLayers().push(VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER)
    }

    return () => {
      monitorfishMap.removeLayer(VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER)
    }
  }, [isSuperUser])

  return null
}
