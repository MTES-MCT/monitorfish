import { fitMapToVesselTrack } from '@features/Map/useCases/animateMap'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import { VesselSidebarActionButton } from './VesselSidebarActionButton'
import ShowTrackSVG from '../../../../icons/Bouton_afficher_toute_la_piste.svg?react'

export function AnimateToTrack({ isSidebarOpen }) {
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const vesselTrackExtent = useMainAppSelector(state => state.vessel.vesselTrackExtent)

  return (
    <VesselSidebarActionButton
      $isSidebarOpen={isSidebarOpen}
      $top={103}
      data-cy="animate-to-track"
      disabled={!selectedVesselPositions?.length}
      // eslint-disable-next-line react/jsx-no-bind
      onClick={() => {
        if (vesselTrackExtent?.length) {
          fitMapToVesselTrack(vesselTrackExtent)
        }
      }}
      title="Centrer sur la piste"
    >
      <ShowTrackIcon />
    </VesselSidebarActionButton>
  )
}

const ShowTrackIcon = styled(ShowTrackSVG)`
  width: 30px;
`
