import styled from 'styled-components'

import { animateToExtent } from '../../../../domain/shared_slices/Map'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import ShowTrackSVG from '../../../icons/Bouton_afficher_toute_la_piste.svg?react'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function AnimateToTrack({ isSidebarOpen }) {
  const { healthcheckTextWarning, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const { selectedVesselPositions } = useMainAppSelector(state => state.vessel)
  const dispatch = useMainAppDispatch()

  return (
    <VesselSidebarActionButton
      data-cy="animate-to-track"
      disabled={!selectedVesselPositions?.length}
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={false}
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
