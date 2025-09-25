import { CountryFlag } from '@components/CountryFlag'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { hideVesselTrack } from '../../../Vessel/useCases/hideVesselTrack'
import { showVessel } from '../../../Vessel/useCases/showVessel'
import { showVesselTrack } from '../../../Vessel/useCases/showVesselTrack'
import { unselectVessel } from '../../../Vessel/useCases/unselectVessel'
import { removeVesselFromFavorites } from '../../slice'

import type { Vessel } from '@features/Vessel/Vessel.types'

type FavoriteVesselProps = Readonly<{
  favorite: Vessel.VesselIdentity
  isLastItem: boolean
  isTrackShowed: boolean
  isVesselShowed: boolean
  vesselCompositeIdentifier: Vessel.VesselCompositeIdentifier
}>

export function FavoriteVessel({
  favorite,
  isLastItem,
  isTrackShowed,
  isVesselShowed,
  vesselCompositeIdentifier
}: FavoriteVesselProps) {
  const dispatch = useMainAppDispatch()

  function showVesselSidebar() {
    if (isTrackShowed) {
      dispatch(hideVesselTrack(vesselCompositeIdentifier))
    }

    dispatch(showVessel(favorite, false))
  }

  function hideVesselTrackOrSidebar() {
    if (isTrackShowed) {
      dispatch(hideVesselTrack(vesselCompositeIdentifier))

      return
    }

    if (isVesselShowed) {
      dispatch(unselectVessel())
    }
  }

  return (
    <Wrapper $isLastItem={isLastItem}>
      <CountryFlag countryCode={favorite.flagState} size={[20, 14]} />
      <VesselName data-cy="favorite-vessel-name" title={favorite.vesselName ?? undefined}>
        {favorite.vesselName}
      </VesselName>
      <Icons>
        {isVesselShowed ? (
          <IconButton
            accent={Accent.TERTIARY}
            data-cy="favorite-vessel-close-vessel-sidebar"
            Icon={Icon.Summary}
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={() => dispatch(unselectVessel())}
            title="Fermer la fiche navire"
          />
        ) : (
          <IconButton
            accent={Accent.TERTIARY}
            color={THEME.color.lightGray}
            data-cy="favorite-vessel-show-vessel-sidebar"
            Icon={Icon.Summary}
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={showVesselSidebar}
            title="Afficher la fiche navire"
          />
        )}
        {isTrackShowed || isVesselShowed ? (
          <IconButton
            accent={Accent.TERTIARY}
            data-cy="favorite-vessel-hide-vessel-track"
            Icon={Icon.Display}
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={hideVesselTrackOrSidebar}
          />
        ) : (
          <IconButton
            accent={Accent.TERTIARY}
            color={THEME.color.lightGray}
            data-cy="favorite-vessel-show-vessel-track"
            Icon={Icon.Hide}
            onClick={() => dispatch(showVesselTrack(favorite, true, null, true))}
          />
        )}
        <IconButton
          accent={Accent.TERTIARY}
          color={THEME.color.lightGray}
          data-cy="favorite-vessel-delete-vessel"
          Icon={Icon.Close}
          onClick={() => dispatch(removeVesselFromFavorites(vesselCompositeIdentifier))}
          title="Supprimer le navire de mes navires suivis"
        />
      </Icons>
    </Wrapper>
  )
}

const Icons = styled.div`
  margin-left: auto;
  margin-right: 0px;
  flex-shrink: 0;
  display: flex;
  height: 36px;
  align-items: center;
`

const VesselName = styled.span`
  font-size: 13px;
  padding-left: 6px;
  flex-shrink: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${THEME.color.gunMetal};
  font-weight: 500;
`

const Wrapper = styled.li<{
  $isLastItem: boolean
}>`
  height: 36px;
  display: flex;
  align-items: center;
  border-bottom: ${p => (p.$isLastItem ? 'unset' : `1px solid ${p.theme.color.lightGray}`)};
  padding-left: 12px;
  padding-right: 10px;
`
