import { COLORS } from '@constants/constants'
import { addVesselToFavorites, removeVesselFromFavorites } from '@features/FavoriteVessel/slice'
import { unselectVessel } from '@features/Vessel/useCases/unselectVessel'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import styled from 'styled-components'

import CloseIconSVG from '../../../../../icons/Croix_grise.svg?react'
import FavoriteSVG from '../../../../../icons/Etoile_navire_suivi.svg?react'

export function VesselName({ focusOnVesselSearchInput }) {
  const dispatch = useMainAppDispatch()
  const vesselSidebarIsOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const favorites = useMainAppSelector(state => state.favoriteVessel.favorites)
  const isFavorite = useMemo(
    () =>
      selectedVesselIdentity &&
      !!favorites.find(
        favoriteVessel =>
          getVesselCompositeIdentifier(favoriteVessel) === getVesselCompositeIdentifier(selectedVesselIdentity)
      ),
    [selectedVesselIdentity, favorites]
  )

  const addOrRemoveToFavorites = function (e) {
    e.stopPropagation()

    if (isFavorite) {
      dispatch(removeVesselFromFavorites(getVesselCompositeIdentifier(selectedVesselIdentity)))
    } else {
      dispatch(addVesselToFavorites(selectedVesselIdentity))
    }
  }

  const close = function (e) {
    e.stopPropagation()

    dispatch(unselectVessel())
  }

  return (
    <Wrapper
      $isOpen={vesselSidebarIsOpen}
      data-cy="vessel-search-selected-vessel-title"
      onClick={() => focusOnVesselSearchInput(true)}
    >
      {selectedVesselIdentity?.flagState && (
        <Flag
          src={`flags/${selectedVesselIdentity.flagState.toLowerCase()}.svg`}
          title={countries.getName(selectedVesselIdentity.flagState, 'fr')}
        />
      )}
      <FavoriteIcon
        $isFavorite={!!isFavorite}
        $isFlagShown={!!selectedVesselIdentity?.flagState}
        data-cy="sidebar-add-vessel-to-favorites"
        /* eslint-disable-next-line react/jsx-no-bind */
        onClick={addOrRemoveToFavorites}
      />
      <Name title={selectedVesselIdentity?.vesselName ?? undefined}>{getVesselName(selectedVesselIdentity)}</Name>
      <CloseIcon
        data-cy="vessel-search-selected-vessel-close-title"
        /* eslint-disable-next-line react/jsx-no-bind */
        onClick={close}
      />
    </Wrapper>
  )
}

function getVesselName(selectedVesselIdentity) {
  let flagState = 'INCONNU'
  if (selectedVesselIdentity.flagState !== 'UNDEFINED') {
    flagState = `${selectedVesselIdentity.flagState}`
  }

  return `${selectedVesselIdentity.vesselName} (${flagState.toUpperCase()})`
}

const Wrapper = styled.div<{
  $isOpen: boolean
}>`
  font-weight: bolder;
  margin: 0;
  background-color: ${COLORS.charcoal};
  border: none;
  border-radius: 0;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${COLORS.gainsboro};
  height: 40px;
  width: ${p => (p.$isOpen ? 490 : 320)}px;
  padding: 0 0 0 10px;
  flex: 3;
  text-align: left;
  cursor: text;
  transition: width 0.7s ease forwards;

  &:hover,
  &:focus {
    border-bottom: 1px ${p => p.theme.color.lightGray} solid;
  }
`

const FavoriteIcon = styled(FavoriteSVG)<{
  $isFavorite: boolean
  $isFlagShown: boolean
}>`
  width: 23px;
  height: 23px;
  vertical-align: middle;
  margin-left: ${p => (p.$isFlagShown ? 7 : 0)}px;
  cursor: pointer;
  path {
    fill: ${p => (p.$isFavorite ? COLORS.gainsboro : 'none')};
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
  color: ${p => p.theme.color.gainsboro};
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
