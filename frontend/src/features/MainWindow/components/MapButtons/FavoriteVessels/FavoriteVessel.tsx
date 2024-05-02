import { CountryFlag } from '@components/CountryFlag'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { removeVesselFromFavorites } from '../../../../../domain/shared_slices/FavoriteVessel'
import { hideVesselTrack } from '../../../../../domain/use_cases/vessel/hideVesselTrack'
import { showVessel } from '../../../../../domain/use_cases/vessel/showVessel'
import { showVesselTrack } from '../../../../../domain/use_cases/vessel/showVesselTrack'
import { unselectVessel } from '../../../../../domain/use_cases/vessel/unselectVessel'

import type { VesselCompositeIdentifier, VesselIdentity } from '../../../../../domain/entities/vessel/types'

type FavoriteVesselProps = Readonly<{
  favorite: VesselIdentity
  isLastItem: boolean
  isTrackShowed: boolean
  isVesselShowed: boolean
  vesselCompositeIdentifier: VesselCompositeIdentifier
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

    dispatch(showVessel(favorite, false, true))
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
    <Wrapper isLastItem={isLastItem}>
      <CountryFlag countryCode={favorite.flagState} size={[20, 14]} />
      <VesselName data-cy="favorite-vessel-name" title={favorite.vesselName ?? undefined}>
        {favorite.vesselName}
      </VesselName>
      <Icons>
        {isVesselShowed ? (
          <Icon.Summary
            data-cy="favorite-vessel-close-vessel-sidebar"
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={() => dispatch(unselectVessel())}
            size={20}
            title="Fermer la fiche navire"
          />
        ) : (
          <Icon.Summary
            color={THEME.color.lightGray}
            data-cy="favorite-vessel-show-vessel-sidebar"
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={showVesselSidebar}
            size={20}
            title="Afficher la fiche navire"
          />
        )}
        {isTrackShowed || isVesselShowed ? (
          <Icon.Display
            data-cy="favorite-vessel-hide-vessel-track"
            /* eslint-disable-next-line react/jsx-no-bind */
            onClick={hideVesselTrackOrSidebar}
            size={20}
          />
        ) : (
          <Icon.Hide
            color={THEME.color.lightGray}
            data-cy="favorite-vessel-show-vessel-track"
            onClick={() => dispatch(showVesselTrack(favorite, true, null, true))}
            size={20}
          />
        )}
        <Icon.Close
          color={THEME.color.slateGray}
          data-cy="favorite-vessel-delete-vessel"
          onClick={() => dispatch(removeVesselFromFavorites(vesselCompositeIdentifier))}
          size={14}
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
  cursor: pointer;

  .Element-IconBox {
    left: auto;
    padding-left: 6px;
  }
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
  isLastItem: boolean
}>`
  height: 36px;
  display: flex;
  align-items: center;
  border-bottom: ${p => (p.isLastItem ? 'unset' : `1px solid ${p.theme.color.lightGray}`)};
  padding-left: 12px;
  padding-right: 10px;
`
