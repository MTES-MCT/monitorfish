import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import { ReactComponent as FavoriteSVG } from '../icons/favorite.svg'
import { COLORS } from '../../constants/constants'
import FavoriteVessel from './FavoriteVessel'
import { getVesselId } from '../../domain/entities/vessel'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'

const FavoriteVessels = () => {
  const {
    favorites
  } = useSelector(state => state.favoriteVessel)
  const {
    /** @type {Object.<string, ShowedVesselTrack>} */
    vesselsTracksShowed,
    selectedVesselIdentity
  } = useSelector(state => state.vessel)
  const {
    healthcheckTextWarning
  } = useSelector(state => state.global)

  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  console.log(Object.values(vesselsTracksShowed))

  return (
    <>
      <Wrapper ref={wrapperRef}>
        <FavoriteVesselsNumber isOpen={isOpen}>
          {favorites?.length || 0}
        </FavoriteVesselsNumber>
        <FavoriteVesselsIcon
          data-cy={'vessel-favorites'}
          healthcheckTextWarning={healthcheckTextWarning}
          isOpen={isOpen}
          title={'Mes navires suivis'}
          onClick={() => setIsOpen(!isOpen)}>
          <FavoritesIcon/>
        </FavoriteVesselsIcon>
        <FavoriteVesselsBox
          healthcheckTextWarning={healthcheckTextWarning}
          isOpen={isOpen}>
          <Header isFirst={true}>
            Mes navires suivis
          </Header>
          {
            favorites?.length
              ? <List>
                {
                  favorites
                    .map((favoriteVessel, index) => {
                      const id = getVesselId(favoriteVessel)

                      return <FavoriteVessel
                        key={id}
                        identity={id}
                        vesselIsShowed={selectedVesselIdentity
                          ? id === getVesselId(selectedVesselIdentity)
                          : false}
                        trackIsShowed={Object.values(vesselsTracksShowed)?.find(vessel => vessel.vesselId === id)}
                        favorite={favoriteVessel}
                        isLastItem={favorites.length === index + 1}
                      />
                    })
                }
              </List>
              : <NoVesselInFavorites>
                Aucun navire suivi
              </NoVesselInFavorites>
          }
        </FavoriteVesselsBox>
      </Wrapper>
    </>
  )
}

const FavoriteVesselsNumber = styled.div`
  display: inline-block;
  position: absolute;
  width: 14px;
  height: 18px;
  border-radius: 10px;
  top: 108px;
  line-height: 15px;
  left: 40px;
  background-color: ${props => props.isOpen ? COLORS.charcoal : COLORS.shadowBlueLight};
  transition: all 0.5s;
  color:${props => props.isOpen ? COLORS.white : COLORS.gunMetal};
  z-index: 100;
  padding: 0 2px;
`

const List = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
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
  background: ${COLORS.background};
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
