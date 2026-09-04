import { useDeleteFavoriteVesselMutation, useGetFavoriteVesselsQuery } from '@features/FavoriteVessel/apis'
import { addFavoriteVessel } from '@features/FavoriteVessel/useCases/addFavoriteVessel'
import {
  getFavoriteVesselFromVesselIdentity,
  getVesselIdentityFromFavoriteVessel,
  isSameVesselIdentity
} from '@features/FavoriteVessel/utils'
import { unselectVessel } from '@features/Vessel/useCases/unselectVessel'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import styled from 'styled-components'

import CloseIconSVG from '../../../../../icons/Croix_grise.svg?react'
import FavoriteSVG from '../../../../../icons/Etoile_navire_suivi.svg?react'

export function VesselName({ focusOnVesselSearchInput }) {
  const dispatch = useMainAppDispatch()
  const vesselSidebarIsOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const { data: favoriteVessels } = useGetFavoriteVesselsQuery()
  const [deleteFavoriteVessel] = useDeleteFavoriteVesselMutation()

  const isFavorite = useMemo(
    () =>
      !!selectedVesselIdentity &&
      (favoriteVessels ?? []).some(favoriteVessel =>
        isSameVesselIdentity(getVesselIdentityFromFavoriteVessel(favoriteVessel), selectedVesselIdentity)
      ),
    [favoriteVessels, selectedVesselIdentity]
  )

  const addOrRemoveToFavorites = function (e) {
    e.stopPropagation()

    if (!selectedVesselIdentity) {
      return
    }

    if (isFavorite) {
      deleteFavoriteVessel(getFavoriteVesselFromVesselIdentity(selectedVesselIdentity))
    } else {
      dispatch(addFavoriteVessel(selectedVesselIdentity))
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
        title="Fermer la fiche navire"
      />
    </Wrapper>
  )
}

function getVesselName(selectedVesselIdentity) {
  let flagState = 'INCONNU'
  if (selectedVesselIdentity.flagState !== 'UNDEFINED') {
    flagState = `${selectedVesselIdentity.flagState}`
  }

  return `${selectedVesselIdentity.vesselName ?? ''} (${flagState.toUpperCase()})`
}

const Wrapper = styled.div<{
  $isOpen: boolean
}>`
  background-color: ${p => p.theme.color.charcoal};
  border: none;
  border-radius: 2px 2px 0 0;
  box-sizing: border-box;
  color: ${p => p.theme.color.gainsboro};
  cursor: text;
  font-weight: bolder;
  flex: 3;
  height: 40px;
  margin: 0;
  padding: 0 0 0 10px;
  text-align: left;
  transition: width 0.7s ease forwards;
  width: ${p => (p.$isOpen ? 500 : 320)}px;
`

const FavoriteIcon = styled(FavoriteSVG)<{
  $isFavorite: boolean
  $isFlagShown: boolean
}>`
  cursor: pointer;
  height: 23px;
  margin-left: ${p => (p.$isFlagShown ? 7 : 0)}px;
  vertical-align: middle;
  width: 23px;
  path {
    fill: ${p => (p.$isFavorite ? THEME.color.gainsboro : 'none')};
  }
`

const Flag = styled.img`
  display: inline-block;
  font-size: 27px;
  height: 24px;
  margin-left: 0px;
  vertical-align: middle;
`

const Name = styled.span`
  display: inline-block;
  color: ${p => p.theme.color.gainsboro};
  font-size: 22px;
  font-weight: 500;
  line-height: 39px;
  margin-left: 7px;
  max-width: 375px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
`

const CloseIcon = styled(CloseIconSVG)`
  cursor: pointer;
  float: right;
  height: 24px;
  padding: 9px 9px 7px 7px;
  width: 20px;
`
