import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_BEACON_MALFUNCTION_LAYER } from '@features/Vessel/layers/VesselBeaconMalfunctionLayer/constants'
import { selectAreVesselAlertsAndBeaconMalfunctionsDisplayed } from '@features/Vessel/selectors/vesselWarnings'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselBeaconMalfunctionLayer() {
  const isSuperUser = useIsSuperUser()
  const isDisplayed = useMainAppSelector(selectAreVesselAlertsAndBeaconMalfunctionsDisplayed)
  useMapLayer(VESSEL_BEACON_MALFUNCTION_LAYER, isSuperUser && isDisplayed)

  return null
}
