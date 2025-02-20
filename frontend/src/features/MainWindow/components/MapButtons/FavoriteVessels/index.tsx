import { COLORS } from '@constants/constants'
import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { setLeftMapBoxOpened } from 'domain/shared_slices/Global'
import styled from 'styled-components'

import { FavoriteVessel } from './FavoriteVessel'
import { MapPropertyTrigger } from '../../../../commonComponents/MapPropertyTrigger'
import { MapComponent } from '../../../../commonStyles/MapComponent'
import HidingOtherTracksSVG from '../../../../icons/Bouton_masquer_pistes_actif.svg?react'
import ShowingOtherTracksSVG from '../../../../icons/Bouton_masquer_pistes_inactif.svg?react'
import { setHideNonSelectedVessels } from '../../../../Vessel/slice'

export function FavoriteVessels() {
  const dispatch = useMainAppDispatch()
  const favorites = useMainAppSelector(state => state.favoriteVessel.favorites)
  const { hideNonSelectedVessels, selectedVesselIdentity, vesselsTracksShowed } = useMainAppSelector(
    state => state.vessel
  )
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const isActive = leftMapBoxOpened === MapBox.FAVORITE_VESSELS

  return (
    <Wrapper>
      <MapToolButton
        badgeBackgroundColor={isActive ? THEME.color.charcoal : THEME.color.gainsboro}
        badgeColor={isActive ? THEME.color.white : THEME.color.gunMetal}
        badgeNumber={favorites?.length || 0}
        data-cy="favorite-vessels"
        Icon={Icon.Favorite}
        isActive={isActive}
        isLeftButton
        onClick={() =>
          dispatch(
            setLeftMapBoxOpened(leftMapBoxOpened === MapBox.FAVORITE_VESSELS ? undefined : MapBox.FAVORITE_VESSELS)
          )
        }
        style={{ top: 73 }}
        title="Mes navires suivis"
      />
      <FavoriteVesselsBox
        $isOpen={leftMapBoxOpened === MapBox.FAVORITE_VESSELS}
        data-cy="favorite-vessels-box"
        isHidden={previewFilteredVesselsMode}
      >
        <Header $isFirst>Mes navires suivis</Header>
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
      </FavoriteVesselsBox>
    </Wrapper>
  )
}

const List = styled.ul`
  margin: 0;
  background-color: ${p => p.theme.color.white};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 550px;
  overflow-x: hidden;
  color: ${COLORS.gunMetal};
`

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const NoVesselInFavorites = styled.div`
  font-size: 13px;
  margin: 15px;
  color: ${COLORS.gunMetal};
`

const Header = styled.div<{
  $isFirst: boolean
}>`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${p => (p.$isFirst ? '2px' : '0')};
  border-top-right-radius: ${p => (p.$isFirst ? '2px' : '0')};
`

const FavoriteVesselsBox = styled(MapComponent)<{
  $isOpen: boolean
}>`
  width: 305px;
  background: ${p => p.theme.color.white};
  margin-left: ${p => (p.$isOpen ? '45px' : '-420px')};
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  top: 73px;
  left: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`
