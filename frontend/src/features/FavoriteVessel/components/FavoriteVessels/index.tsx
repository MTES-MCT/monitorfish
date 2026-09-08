import { useGetFavoriteVesselsQuery } from '@features/FavoriteVessel/apis'
import { initFavoriteVessels } from '@features/FavoriteVessel/useCases/initFavoriteVessels'
import { getVesselIdentityFromFavoriteVessel } from '@features/FavoriteVessel/utils'
import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { sortBy } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { FavoriteVessel } from './FavoriteVessel'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { setLeftMapBoxOpened } from '../../../../domain/shared_slices/Global'
import { MapPropertyTrigger } from '../../../commonComponents/MapPropertyTrigger'
import HidingOtherTracksSVG from '../../../icons/Bouton_masquer_pistes_actif.svg?react'
import ShowingOtherTracksSVG from '../../../icons/Bouton_masquer_pistes_inactif.svg?react'
import { setHideNonSelectedVessels } from '../../../Vessel/slice'

import type { Vessel } from '@features/Vessel/Vessel.types'

export function FavoriteVessels() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const { hideNonSelectedVessels, selectedVesselIdentity, vesselsTracksShowed } = useMainAppSelector(
    state => state.vessel
  )
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const { isOpened, isRendered } = useDisplayMapBox(leftMapBoxOpened === MapBox.FAVORITE_VESSELS)
  const { data: favoriteVessels, isSuccess: areFavoriteVesselsFetched } = useGetFavoriteVesselsQuery()
  const favoriteVesselsCount = favoriteVessels?.length ?? 0

  const storedInLocalStorage = useMemo(
    () => localStorageManager.get<Array<Vessel.VesselIdentity>>(LocalStorageKey.FavoriteVessels, []),
    []
  )

  /**
   * Seed the user favorite vessels from the browser local storage, once, the first time the list is
   * fetched empty. If the user has several browsers with saved local storages, only the first one used
   * after this migration is taken into account.
   */
  useEffect(() => {
    if (!areFavoriteVesselsFetched || !!favoriteVessels?.length || !storedInLocalStorage.length) {
      return
    }

    dispatch(initFavoriteVessels(storedInLocalStorage))
  }, [areFavoriteVesselsFetched, dispatch, favoriteVessels, storedInLocalStorage])

  return (
    <>
      <MapToolButton
        badgeBackgroundColor={isOpened ? THEME.color.charcoal : THEME.color.gainsboro}
        badgeColor={isOpened ? THEME.color.white : THEME.color.gunMetal}
        badgeNumber={favoriteVesselsCount > 0 ? favoriteVesselsCount : undefined}
        data-cy="favorite-vessels"
        Icon={Icon.Favorite}
        isActive={isOpened}
        isShrinkable={false}
        onClick={() => {
          if (!isOpened) {
            trackEvent({
              action: `Ouverture de la vue "Mes navires suivis"`,
              category: 'DISPLAY_FEATURE',
              name: isSuperUser ? 'CNSP' : 'EXT'
            })
          }
          dispatch(setLeftMapBoxOpened(isOpened ? undefined : MapBox.FAVORITE_VESSELS))
        }}
        title="Mes navires suivis"
      />
      {isRendered && (
        <FavoriteVesselsBox
          data-cy="favorite-vessels-box"
          isHidden={!!previewFilteredVesselsMode}
          isLeftBox
          isOpen={isOpened}
        >
          <Header $isFirst>Mes navires suivis</Header>
          {favoriteVessels?.length ? (
            <List>
              {sortBy(favoriteVessels, favorite => favorite.name).map((favoriteVessel, index) => {
                const vesselCompositeIdentifier = getVesselCompositeIdentifier(
                  getVesselIdentityFromFavoriteVessel(favoriteVessel)
                )
                const isTrackShowed = !!Object.values(vesselsTracksShowed)?.find(
                  vessel => vessel.vesselCompositeIdentifier === vesselCompositeIdentifier
                )

                return (
                  <FavoriteVessel
                    key={vesselCompositeIdentifier}
                    favoriteVessel={favoriteVessel}
                    isLastItem={favoriteVessels.length === index + 1}
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
            disabled={!favoriteVessels?.length}
            IconSVG={hideNonSelectedVessels ? ShowingOtherTracksSVG : HidingOtherTracksSVG}
            inverse
            text="les navires non sélectionnés"
            updateBooleanProperty={isHidden => dispatch(setHideNonSelectedVessels(isHidden))}
          />
        </FavoriteVesselsBox>
      )}
    </>
  )
}

const List = styled.ul`
  background-color: ${p => p.theme.color.white};
  border-radius: 0 0 2px 2px;
  color: ${THEME.color.gunMetal};
  margin: 0;
  max-height: 550px;
  overflow-x: hidden;
  padding: 0;
`

const NoVesselInFavorites = styled.div`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  margin: 15px;
`

const Header = styled.div<{
  $isFirst: boolean
}>`
  background: ${THEME.color.charcoal};
  border-top-left-radius: ${p => (p.$isFirst ? '2px' : '0')};
  border-top-right-radius: ${p => (p.$isFirst ? '2px' : '0')};
  color: ${THEME.color.gainsboro};
  font-size: 16px;
  padding: 9px 0 7px 15px;
  text-align: left;
`

const FavoriteVesselsBox = styled(MapToolBox)`
  top: 0;
  width: 305px;
`
