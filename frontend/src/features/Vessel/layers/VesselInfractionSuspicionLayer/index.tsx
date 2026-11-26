import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { VESSEL_INFRACTION_SUSPICION_LAYER } from '@features/Vessel/layers/VesselInfractionSuspicionLayer/constants'
import { selectAreVesselInfractionSuspicionsDisplayed } from '@features/Vessel/selectors/vesselWarnings'
import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function VesselInfractionSuspicionLayer() {
  const isSuperUser = useIsSuperUser()
  const isDisplayed = useMainAppSelector(selectAreVesselInfractionSuspicionsDisplayed)
  useMapLayer(VESSEL_INFRACTION_SUSPICION_LAYER, isSuperUser && isDisplayed)

  return null
}
