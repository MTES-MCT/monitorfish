import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { animateToExtent } from 'domain/shared_slices/Map'
import styled from 'styled-components'

import ShowTrackSVG from '../../../../../icons/Bouton_afficher_toute_la_piste.svg?react'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function AnimateToTrack({ isSidebarOpen }) {
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const dispatch = useMainAppDispatch()

  return (
    <VesselSidebarActionButton
      data-cy="animate-to-track"
      disabled={!selectedVesselPositions?.length}
      isRightMenuOpen={rightMenuIsOpen}
      isSidebarOpen={isSidebarOpen}
      onClick={() => dispatch(animateToExtent())}
      title="Centrer sur la piste"
      top={153}
    >
      <ShowTrackIcon />
    </VesselSidebarActionButton>
  )
}

const ShowTrackIcon = styled(ShowTrackSVG)`
  width: 30px;
`
