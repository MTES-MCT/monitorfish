import countries from 'i18n-iso-countries'
import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as CloseIconSVG } from '../icons/Croix_grise.svg'
import { useDispatch, useSelector } from 'react-redux'
import { getVesselId } from '../../domain/entities/vessel'
import { ReactComponent as FavoriteSVG } from '../icons/Etoile_navire_suivi.svg'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { addVesselToFavorites, removeVesselFromFavorites } from '../../domain/shared_slices/FavoriteVessel'

function VesselName ({ focusOnVesselSearchInput }) {
  const dispatch = useDispatch()
  const vesselSidebarIsOpen = useSelector(state => state.vessel.vesselSidebarIsOpen)
  const selectedVesselIdentity = useSelector(state => state.vessel.selectedVesselIdentity)
  const favorites = useSelector(state => state.favoriteVessel.favorites)
  const isFavorite = useMemo(() => {
    return selectedVesselIdentity && !!favorites.find(favoriteVessel => getVesselId(favoriteVessel) === getVesselId(selectedVesselIdentity))
  }, [selectedVesselIdentity, favorites])

  const addOrRemoveToFavorites = useCallback(e => {
    if (isFavorite) {
      dispatch(removeVesselFromFavorites(getVesselId(selectedVesselIdentity)))
    } else {
      dispatch(addVesselToFavorites(selectedVesselIdentity))
    }

    e.stopPropagation()
  }, [selectedVesselIdentity, isFavorite])

  return (
    <Wrapper
      onClick={() => focusOnVesselSearchInput(true)}
      data-cy={'vessel-search-selected-vessel-title'}
      vesselSidebarIsOpen={vesselSidebarIsOpen}
    >
      {
        selectedVesselIdentity?.flagState
          ? <Flag
            title={countries.getName(selectedVesselIdentity.flagState, 'fr')}
            src={`flags/${selectedVesselIdentity.flagState.toLowerCase()}.svg`}/>
          : null
      }
      <FavoriteIcon
        $flagIsShown={selectedVesselIdentity?.flagState}
        $isFavorite={isFavorite}
        onClick={addOrRemoveToFavorites}
      />
      <Name
        title={selectedVesselIdentity?.vesselName}
      >
        {getVesselName(selectedVesselIdentity)}
      </Name>
      <CloseIcon
        data-cy={'vessel-search-selected-vessel-close-title'}
        onClick={() => dispatch(unselectVessel())}
      />
    </Wrapper>
  )
}

function getVesselName (selectedVesselIdentity) {
  let flagState = 'INCONNU'
  if (selectedVesselIdentity?.flagState !== 'UNDEFINED') {
    flagState = `${selectedVesselIdentity?.flagState}`
  }

  return `${selectedVesselIdentity?.vesselName} (${flagState?.toUpperCase()})`
}

const Wrapper = styled.div`
  font-weight: bolder;
  margin: 0;
  background-color: ${COLORS.charcoal};
  border: none;
  border-radius: 0;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${COLORS.gainsboro};
  height: 40px;
  width: ${props => props.vesselSidebarIsOpen ? 490 : 320}px;
  padding: 0 0 0 10px;
  flex: 3;
  text-align: left;
  cursor: text;
  transition: width 0.7s ease forwards;

  :hover, :focus {
    border-bottom: 1px ${COLORS.gray} solid;
  }
`

const FavoriteIcon = styled(FavoriteSVG)`
  width: 23px;
  height: 23px;
  vertical-align: middle;
  margin-left: ${p => p.$flagIsShown ? 7 : 0}px;
  cursor: pointer;
  path {
    fill: ${p => p.$isFavorite ? COLORS.gainsboro : 'none'};
  }
`

const Flag = styled.img`
  vertical-align: middle;
  font-size: 27px;
  margin-left: 0px;
  display: inline-block;
  height: 24px;
`

const Name = styled.span`
  display: inline-block;
  color: ${COLORS.grayLighter};
  margin-left: 7px;
  line-height: 39px;
  font-weight: 500;
  vertical-align: middle;
  font-size: 22px;
  max-width: 375px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 20px;
  float: right;
  padding: 9px 9px 7px 7px;
  height: 24px;
  cursor: pointer;
`

export default VesselName
