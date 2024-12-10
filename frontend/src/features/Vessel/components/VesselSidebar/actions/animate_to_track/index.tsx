import { animateToExtent } from '@features/Map/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import ShowTrackSVG from '../../../../../icons/Bouton_afficher_toute_la_piste.svg?react'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function AnimateToTrack({ isSidebarOpen }) {
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const dispatch = useMainAppDispatch()

  return (
    <VesselSidebarActionButton
      $isRightMenuOpen={rightMenuIsOpen}
      $isSidebarOpen={isSidebarOpen}
      $top={153}
      data-cy="animate-to-track"
      disabled={!selectedVesselPositions?.length}
      onClick={() => dispatch(animateToExtent())}
      title="Centrer sur la piste"
    >
      <ShowTrackIcon />
    </VesselSidebarActionButton>
  )
}

const ShowTrackIcon = styled(ShowTrackSVG)`
  width: 30px;
`
