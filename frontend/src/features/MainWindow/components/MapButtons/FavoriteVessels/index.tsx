import { COLORS } from '@constants/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { MapBox } from 'domain/entities/map/constants'
import { setLeftMapBoxOpened } from 'domain/shared_slices/Global'
import { useRef } from 'react'
import styled from 'styled-components'

import { FavoriteVessel } from './FavoriteVessel'
import { getVesselCompositeIdentifier } from '../../../../../domain/entities/vessel/vessel'
import { setHideNonSelectedVessels } from '../../../../../domain/shared_slices/Vessel'
import { MapPropertyTrigger } from '../../../../commonComponents/MapPropertyTrigger'
import { MapComponent } from '../../../../commonStyles/MapComponent'
import HidingOtherTracksSVG from '../../icons/Bouton_masquer_pistes_actif.svg?react'
import ShowingOtherTracksSVG from '../../icons/Bouton_masquer_pistes_inactif.svg?react'
import FavoriteSVG from '../../icons/favorite.svg?react'
import { MapButton } from '../MapButton'

export function FavoriteVessels() {
  const dispatch = useMainAppDispatch()
  const { favorites } = useMainAppSelector(state => state.favoriteVessel)
  const { hideNonSelectedVessels, selectedVesselIdentity, vesselsTracksShowed } = useMainAppSelector(
    state => state.vessel
  )
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)

  const wrapperRef = useRef(null)

  return (
    <Wrapper ref={wrapperRef}>
      <FavoriteVesselsNumber
        data-cy="favorite-vessels-number"
        isHidden={previewFilteredVesselsMode}
        isOpen={leftMapBoxOpened === MapBox.FAVORITE_VESSELS}
      >
        {favorites?.length || 0}
      </FavoriteVesselsNumber>
      <FavoriteVesselsIcon
        data-cy="favorite-vessels"
        isHidden={!!previewFilteredVesselsMode}
        isOpen={leftMapBoxOpened === MapBox.FAVORITE_VESSELS}
        onClick={() =>
          dispatch(
            setLeftMapBoxOpened(leftMapBoxOpened === MapBox.FAVORITE_VESSELS ? undefined : MapBox.FAVORITE_VESSELS)
          )
        }
        title="Mes navires suivis"
      >
        <FavoritesIcon />
      </FavoriteVesselsIcon>
      <FavoriteVesselsBox
        data-cy="favorite-vessels-box"
        isHidden={previewFilteredVesselsMode}
        isOpen={leftMapBoxOpened === MapBox.FAVORITE_VESSELS}
      >
        <Header isFirst>Mes navires suivis</Header>
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

const FavoriteVesselsNumber = styled(MapComponent)<{
  isOpen: boolean
}>`
  display: inline-block;
  position: absolute;
  width: 14px;
  height: 18px;
  border-radius: 10px;
  top: 56px;
  line-height: 15px;
  left: 40px;
  background-color: ${p => (p.isOpen ? p.theme.color.charcoal : p.theme.color.gainsboro)};
  transition: all 0.5s;
  color: ${p => (p.isOpen ? p.theme.color.white : p.theme.color.gunMetal)};
  z-index: 100;
  padding: 0 2px;
  text-align: center;
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
  isFirst: boolean
}>`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${p => (p.isFirst ? '2px' : '0')};
  border-top-right-radius: ${p => (p.isFirst ? '2px' : '0')};
`

const FavoriteVesselsBox = styled(MapComponent)<{
  isOpen: boolean
}>`
  width: 305px;
  background: ${p => p.theme.color.white};
  margin-left: ${p => (p.isOpen ? '45px' : '-420px')};
  opacity: ${p => (p.isOpen ? '1' : '0')};
  top: 65px;
  left: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const FavoriteVesselsIcon = styled(MapButton)<{
  isOpen: boolean
}>`
  position: absolute;
  display: inline-block;
  z-index: 99;
  top: 65px;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  left: 10px;
  background: ${p => (p.isOpen ? p.theme.color.blueGray : p.theme.color.charcoal)};
  transition: all 0.3s;

  :hover,
  :focus {
    background: ${p => (p.isOpen ? p.theme.color.blueGray : p.theme.color.charcoal)};
  }
`

const FavoritesIcon = styled(FavoriteSVG)`
  width: 40px;
  height: 40px;
`
