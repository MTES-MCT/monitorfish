import { VESSEL_ALERT_LAYER } from '@features/Vessel/layers/VesselAlertLayer/constants'
import { useEffect } from 'react'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { monitorfishMap } from '../../../Map/monitorfishMap'

export function VesselAlertLayer() {
  const isSuperUser = useIsSuperUser()

  useEffect(() => {
    if (isSuperUser) {
      monitorfishMap.getLayers().push(VESSEL_ALERT_LAYER)
    }

    return () => {
      monitorfishMap.removeLayer(VESSEL_ALERT_LAYER)
    }
  }, [isSuperUser])

  return null
}
