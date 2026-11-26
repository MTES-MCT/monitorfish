import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_ALERT_LAYER } from '@features/Vessel/layers/VesselAlertLayer/constants'
import { selectAreVesselAlertsAndBeaconMalfunctionsDisplayed } from '@features/Vessel/selectors/vesselWarnings'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselAlertLayer() {
  const isSuperUser = useIsSuperUser()
  const isDisplayed = useMainAppSelector(selectAreVesselAlertsAndBeaconMalfunctionsDisplayed)
  useMapLayer(VESSEL_ALERT_LAYER, isSuperUser && isDisplayed)

  return null
}
