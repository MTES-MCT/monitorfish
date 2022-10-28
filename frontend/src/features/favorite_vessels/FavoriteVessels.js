import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { LeftBoxOpened } from '../../domain/entities/global'
import { getVesselId } from '../../domain/entities/vessel'
import { setLeftBoxOpened } from '../../domain/shared_slices/Global'
import { setHideNonSelectedVessels } from '../../domain/shared_slices/Vessel'
import { MapPropertyTrigger } from '../commonComponents/MapPropertyTrigger'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { ReactComponent as HidingOtherTracksSVG } from '../icons/Bouton_masquer_pistes_actif.svg'
import { ReactComponent as ShowingOtherTracksSVG } from '../icons/Bouton_masquer_pistes_inactif.svg'
import { ReactComponent as FavoriteSVG } from '../icons/favorite.svg'
import FavoriteVessel from './FavoriteVessel'

function FavoriteVessels() {
  const dispatch = useDispatch()
  const { favorites } = useSelector(state => state.favoriteVessel)
  const {
    /** @type {Object.<string, ShowedVesselTrack>} */
    hideNonSelectedVessels,
    selectedVesselIdentity,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)
  const { healthcheckTextWarning, leftBoxOpened, previewFilteredVesselsMode } = useSelector(state => state.global)

  const wrapperRef = useRef(null)

  return (
    <Wrapper ref={wrapperRef}>
      <FavoriteVesselsNumber
        data-cy="favorite-vessels-number"
        healthcheckTextWarning={healthcheckTextWarning}
        isHidden={previewFilteredVesselsMode}
        isOpen={leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS}
      >
        {favorites?.length || 0}
      </FavoriteVesselsNumber>
      <FavoriteVesselsIcon
        data-cy="favorite-vessels"
        healthcheckTextWarning={healthcheckTextWarning}
        isHidden={previewFilteredVesselsMode}
        isOpen={leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS}
        onClick={() =>
          dispatch(
            setLeftBoxOpened(leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS ? null : LeftBoxOpened.FAVORITE_VESSELS)
          )
        }
        title="Mes navires suivis"
      >
        <FavoritesIcon />
      </FavoriteVesselsIcon>
      <FavoriteVesselsBox
        data-cy="favorite-vessels-box"
        healthcheckTextWarning={healthcheckTextWarning}
        isHidden={previewFilteredVesselsMode}
        isOpen={leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS}
      >
        <Header isFirst>Mes navires suivis</Header>
        {favorites?.length ? (
          <List>
            {favorites.map((favoriteVessel, index) => {
              const vesselId = getVesselId(favoriteVessel)

              return (
                <FavoriteVessel
                  key={vesselId}
                  favorite={favoriteVessel}
                  isLastItem={favorites.length === index + 1}
                  trackIsShowed={Object.values(vesselsTracksShowed)?.find(vessel => vessel.vesselId === vesselId)}
                  vesselId={vesselId}
                  vesselIsShowed={selectedVesselIdentity ? vesselId === getVesselId(selectedVesselIdentity) : false}
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

const FavoriteVesselsNumber = styled(MapComponentStyle)`
  display: inline-block;
  position: absolute;
  width: 14px;
  height: 18px;
  border-radius: 10px;
  top: 56px;
  line-height: 15px;
  left: 40px;
  background-color: ${props => (props.isOpen ? props.theme.color.charcoal : props.theme.color.gainsboro)};
  transition: all 0.5s;
  color: ${props => (props.isOpen ? props.theme.color.white : props.theme.color.gunMetal)};
  z-index: 100;
  padding: 0 2px;
`

const List = styled.ul`
  margin: 0;
  background-color: ${COLORS.white};
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

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => (props.isFirst ? '2px' : '0')};
  border-top-right-radius: ${props => (props.isFirst ? '2px' : '0')};
`

const FavoriteVesselsBox = styled(MapComponentStyle)`
  width: 305px;
  background: ${COLORS.white};
  margin-left: ${props => (props.isOpen ? '45px' : '-420px')};
  opacity: ${props => (props.isOpen ? '1' : '0')};
  top: 65px;
  left: 12px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const FavoriteVesselsIcon = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  z-index: 99;
  top: 65px;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  left: 12px;
  background: ${props => (props.isOpen ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  transition: all 0.3s;

  :hover,
  :focus {
    background: ${props => (props.isOpen ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  }
`

const FavoritesIcon = styled(FavoriteSVG)`
  width: 40px;
  height: 40px;
`

export default FavoriteVessels
