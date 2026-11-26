import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER } from '@features/Vessel/layers/VesselAlertAndBeaconMalfunctionLayer/constants'
import { selectAreVesselAlertsAndBeaconMalfunctionsDisplayed } from '@features/Vessel/selectors/vesselWarnings'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselAlertAndBeaconMalfunctionLayer() {
  const isSuperUser = useIsSuperUser()
  const isDisplayed = useMainAppSelector(selectAreVesselAlertsAndBeaconMalfunctionsDisplayed)
  useMapLayer(VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER, isSuperUser && isDisplayed)

  return null
}
