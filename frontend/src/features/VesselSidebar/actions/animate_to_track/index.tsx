import styled from 'styled-components'

import { animateToExtent } from '../../../../domain/shared_slices/Map'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ReactComponent as ShowTrackSVG } from '../../../icons/Bouton_afficher_toute_la_piste.svg'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function AnimateToTrack({ isSidebarOpen }) {
  const { healthcheckTextWarning, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const dispatch = useMainAppDispatch()

  return (
    <VesselSidebarActionButton
      data-cy="animate-to-track"
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
