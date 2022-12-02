import React, { useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as FavoriteSVG } from '../icons/favorite.svg'
import { COLORS } from '../../constants/constants'
import FavoriteVessel from './FavoriteVessel'
import { getVesselCompositeIdentifier } from '../../domain/entities/vessel/vessel'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { MapPropertyTrigger } from '../commonComponents/MapPropertyTrigger'
import { setHideNonSelectedVessels } from '../../domain/shared_slices/Vessel'
import { ReactComponent as ShowingOtherTracksSVG } from '../icons/Bouton_masquer_pistes_inactif.svg'
import { ReactComponent as HidingOtherTracksSVG } from '../icons/Bouton_masquer_pistes_actif.svg'
import { LeftBoxOpened } from '../../domain/entities/global'
import { setLeftBoxOpened } from '../../domain/shared_slices/Global'

const FavoriteVessels = () => {
  const dispatch = useDispatch()
  const {
    favorites
  } = useSelector(state => state.favoriteVessel)
  const {
    /** @type {Object.<string, ShowedVesselTrack>} */
    vesselsTracksShowed,
    selectedVesselIdentity,
    hideNonSelectedVessels
  } = useSelector(state => state.vessel)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode,
    leftBoxOpened
  } = useSelector(state => state.global)

  const wrapperRef = useRef(null)

  return (
    <>
      <Wrapper ref={wrapperRef}>
        <FavoriteVesselsNumber
          data-cy={'favorite-vessels-number'}
          healthcheckTextWarning={healthcheckTextWarning}
          isHidden={previewFilteredVesselsMode}
          isOpen={leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS}
        >
          {favorites?.length || 0}
        </FavoriteVesselsNumber>
        <FavoriteVesselsIcon
          data-cy={'favorite-vessels'}
          healthcheckTextWarning={healthcheckTextWarning}
          isOpen={leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS}
          isHidden={previewFilteredVesselsMode}
          title={'Mes navires suivis'}
          onClick={() => dispatch(setLeftBoxOpened(leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS ? null : LeftBoxOpened.FAVORITE_VESSELS))}
        >
          <FavoritesIcon/>
        </FavoriteVesselsIcon>
        <FavoriteVesselsBox
          data-cy={'favorite-vessels-box'}
          healthcheckTextWarning={healthcheckTextWarning}
          isOpen={leftBoxOpened === LeftBoxOpened.FAVORITE_VESSELS}
          isHidden={previewFilteredVesselsMode}
        >
          <Header isFirst={true}>
            Mes navires suivis
          </Header>
          {
            favorites?.length
              ? <List>
                {
                  favorites
                    .map((favoriteVessel, index) => {
                      const vesselCompositeIdentifier = getVesselCompositeIdentifier(favoriteVessel)

                      return <FavoriteVessel
                        key={vesselCompositeIdentifier}
                        favorite={favoriteVessel}
                        vesselCompositeIdentifier={vesselCompositeIdentifier}
                        vesselIsShowed={selectedVesselIdentity
                          ? vesselCompositeIdentifier === getVesselCompositeIdentifier(selectedVesselIdentity)
                          : false}
                        trackIsShowed={Object.values(vesselsTracksShowed)?.find(vessel => vessel.vesselCompositeIdentifier === vesselCompositeIdentifier)}
                        isLastItem={favorites.length === index + 1}
                      />
                    })
                }
              </List>
              : <NoVesselInFavorites>
                Aucun navire suivi
              </NoVesselInFavorites>
          }
          <MapPropertyTrigger
            disabled={!favorites?.length}
            inverse
            booleanProperty={hideNonSelectedVessels}
            updateBooleanProperty={isHidden => dispatch(setHideNonSelectedVessels(isHidden))}
            text={'les navires non sélectionnés'}
            Icon={hideNonSelectedVessels ? ShowingOtherTracksSVG : HidingOtherTracksSVG}
          />
        </FavoriteVesselsBox>
      </Wrapper>
    </>
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
  background-color: ${props => props.isOpen ? props.theme.color.charcoal : props.theme.color.gainsboro};
  transition: all 0.5s;
  color:${props => props.isOpen ? COLORS.white : COLORS.gunMetal};
  z-index: 100;
  padding: 0 2px;
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

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const FavoriteVesselsBox = styled(MapComponentStyle)`
  width: 305px;
  background: ${p => p.theme.color.white};
  margin-left: ${props => props.isOpen ? '45px' : '-420px'};
  opacity: ${props => props.isOpen ? '1' : '0'};
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
  color: ${COLORS.blue};
  z-index: 99;
  top: 65px;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  left: 12px;
  background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  transition: all 0.3s;

  :hover, :focus {
      background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const FavoritesIcon = styled(FavoriteSVG)`
  width: 40px;
  height: 40px;
`

export default FavoriteVessels
