import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { setHideNonSelectedVessels } from '../../../../domain/shared_slices/Vessel'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { ReactComponent as HidingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_actif.svg'
import { ReactComponent as ShowingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_inactif.svg'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function HideNonSelectedVessels({ isSidebarOpen }) {
  const dispatch = useAppDispatch()
  const { healthcheckTextWarning, rightMenuIsOpen } = useAppSelector(state => state.global)
  const { hideNonSelectedVessels } = useAppSelector(state => state.vessel)

  return (
    <VesselSidebarActionButton
      backgroundColor={hideNonSelectedVessels ? THEME.color.blueGray[100] : THEME.color.charcoal}
      data-cy="trigger-hide-other-vessels-from-sidebar"
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={false}
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
