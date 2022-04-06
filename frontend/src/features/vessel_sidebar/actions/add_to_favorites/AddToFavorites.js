import React from 'react'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as FavoriteSVG } from '../../../icons/favorite.svg'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { useDispatch, useSelector } from 'react-redux'
import { addVesselToFavorites, removeVesselFromFavorites } from '../../../../domain/shared_slices/FavoriteVessel'
import { getVesselId } from '../../../../domain/entities/vessel'

const AddToFavorites = ({ openBox, rightMenuIsOpen }) => {
  const dispatch = useDispatch()
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const {
    selectedVesselIdentity,
    isFavorite
  } = useSelector(state => {
    const selectedVesselIdentity = state.vessel.selectedVesselIdentity
    const isFavorite = selectedVesselIdentity && state.favoriteVessel.favorites.find(favoriteVessel =>
      getVesselId(favoriteVessel) === getVesselId(selectedVesselIdentity))

    return {
      isFavorite,
      selectedVesselIdentity
    }
  })

  return (
    <AddToFavoritesButton
      data-cy={'add-to-favorites'}
      title={'Ajouter le navire aux navires suivis'}
      healthcheckTextWarning={healthcheckTextWarning}
      openBox={openBox}
      rightMenuIsOpen={rightMenuIsOpen}
      isFavorite={isFavorite}
      onClick={() => isFavorite
        ? dispatch(removeVesselFromFavorites(getVesselId(selectedVesselIdentity)))
        : dispatch(addVesselToFavorites(selectedVesselIdentity))
      }
    >
      <FavoriteIcon/>
    </AddToFavoritesButton>
  )
}

const AddToFavoritesButton = styled(MapButtonStyle)`
  top: 118px;
  height: 30px;
  width: 30px;
  background: ${props => props.isFavorite ? COLORS.shadowBlue : COLORS.charcoal};
  position: absolute;
  margin-right: ${props => props.openBox ? 505 : -45}px;
  opacity: ${props => props.openBox ? 1 : 0};
  ${props => props.isClickable ? 'cursor: pointer;' : null}
  border-radius: 1px;
  z-index: 999;
  right: ${props => props.rightMenuIsOpen && props.openBox ? 55 : 10}px;
  transition: all 0.5s, right 0.3s;

  :hover, :focus {
    background: ${props => props.isFavorite ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const FavoriteIcon = styled(FavoriteSVG)`
  width: 30px;
  height: 30px;
`

export default AddToFavorites
