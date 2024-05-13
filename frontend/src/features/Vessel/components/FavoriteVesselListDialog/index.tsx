import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

import { FavoriteVessel } from './FavoriteVessel'
import { getVesselCompositeIdentifier } from '../../../../domain/entities/vessel/vessel'
import { setHideNonSelectedVessels } from '../../../../domain/shared_slices/Vessel'
import { MapPropertyTrigger } from '../../../commonComponents/MapPropertyTrigger'
import HidingOtherTracksSVG from '../../../icons/Bouton_masquer_pistes_actif.svg?react'
import ShowingOtherTracksSVG from '../../../icons/Bouton_masquer_pistes_inactif.svg?react'

export function FavoriteVesselListDialog() {
  const dispatch = useMainAppDispatch()
  const favorites = useMainAppSelector(state => state.favoriteVessel.favorites)
  const { hideNonSelectedVessels, selectedVesselIdentity, vesselsTracksShowed } = useMainAppSelector(
    state => state.vessel
  )
  const openedLeftDialog = useMainAppSelector(state => state.mainWindow.openedLeftDialog)
  assertNotNullish(openedLeftDialog)

  return (
    <Wrapper data-cy="favorite-vessels-box" style={{ top: openedLeftDialog.topPosition }}>
      <Header>Mes navires suivis</Header>
      {favorites?.length ? (
        <List>
          {favorites.map((favoriteVessel, index) => {
            const vesselCompositeIdentifier = getVesselCompositeIdentifier(favoriteVessel)
            const isTrackShowed = !!Object.values(vesselsTracksShowed)?.find(
              vessel => vessel.vesselCompositeIdentifier === vesselCompositeIdentifier
            )

            return (
              <FavoriteVessel
                key={vesselCompositeIdentifier}
                favorite={favoriteVessel}
                isLastItem={favorites.length === index + 1}
                isTrackShowed={isTrackShowed}
                isVesselShowed={
                  selectedVesselIdentity
                    ? vesselCompositeIdentifier === getVesselCompositeIdentifier(selectedVesselIdentity)
                    : false
                }
                vesselCompositeIdentifier={vesselCompositeIdentifier}
              />
            )
          })}
        </List>
      ) : (
        <NoVesselInFavorites>Aucun navire suivi</NoVesselInFavorites>
      )}
      <MapPropertyTrigger
        booleanProperty={hideNonSelectedVessels}
        disabled={!favorites?.length}
        Icon={hideNonSelectedVessels ? ShowingOtherTracksSVG : HidingOtherTracksSVG}
        inverse
        text="les navires non sélectionnés"
        updateBooleanProperty={isHidden => dispatch(setHideNonSelectedVessels(isHidden))}
      />
    </Wrapper>
  )
}

// TODO Check with Adeline if we plan on keeping the animation (disabled for now).
const Wrapper = styled.div`
  box-sizing: border-box;
  background-color: ${p => p.theme.color.white};
  border-radius: 2px;
  left: 160px;
  position: absolute;
  transition: all 0.5s;
  width: 305px;

  * {
    box-sizing: border-box;
  }
`

const List = styled.ul`
  margin: 0;
  background-color: ${p => p.theme.color.white};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 550px;
  overflow-x: hidden;
  color: ${p => p.theme.color.gunMetal};
`

const NoVesselInFavorites = styled.div`
  font-size: 13px;
  margin: 15px;
  color: ${p => p.theme.color.gunMetal};
`

const Header = styled.div`
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`
