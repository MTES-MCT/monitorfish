import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { setHideNonSelectedVessels } from '../../../../domain/shared_slices/Vessel'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import HidingOtherTracksSVG from '../../../icons/Bouton_masquer_pistes_actif.svg?react'
import ShowingOtherTracksSVG from '../../../icons/Bouton_masquer_pistes_inactif.svg?react'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function HideNonSelectedVessels({ isSidebarOpen }) {
  const dispatch = useMainAppDispatch()
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)

  return (
    <VesselSidebarActionButton
      backgroundColor={hideNonSelectedVessels ? THEME.color.blueGray : THEME.color.charcoal}
      data-cy="trigger-hide-other-vessels-from-sidebar"
      disabled={!selectedVesselPositions?.length}
      isRightMenuOpen={rightMenuIsOpen}
      isSidebarOpen={isSidebarOpen}
      onClick={() => dispatch(setHideNonSelectedVessels(!hideNonSelectedVessels))}
      title={`${hideNonSelectedVessels ? 'Afficher' : 'Cacher'} les autres navires`}
      top={188}
    >
      {hideNonSelectedVessels ? <HidingOtherTracks /> : <ShowingOtherTracks />}
    </VesselSidebarActionButton>
  )
}

const HidingOtherTracks = styled(HidingOtherTracksSVG)`
  width: 30px;
`

const ShowingOtherTracks = styled(ShowingOtherTracksSVG)`
  width: 30px;
`
