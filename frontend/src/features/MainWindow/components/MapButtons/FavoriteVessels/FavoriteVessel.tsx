import { COLORS } from '@constants/constants'
import { Flag } from '@features/VesselList/tableCells'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useCallback } from 'react'
import styled from 'styled-components'

import { removeVesselFromFavorites } from '../../../../../domain/shared_slices/FavoriteVessel'
import { hideVesselTrack } from '../../../../../domain/use_cases/vessel/hideVesselTrack'
import { showVessel } from '../../../../../domain/use_cases/vessel/showVessel'
import { showVesselTrack } from '../../../../../domain/use_cases/vessel/showVesselTrack'
import { unselectVessel } from '../../../../../domain/use_cases/vessel/unselectVessel'
import { CloseIcon } from '../../../../commonStyles/icons/CloseIcon.style'
import { HideIcon } from '../../../../commonStyles/icons/HideIcon.style'
import { PaperDarkIcon, PaperIcon } from '../../../../commonStyles/icons/REGPaperIcon.style'
import { ShowIcon } from '../../../../commonStyles/icons/ShowIcon.style'

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

  const showVesselSidebar = useCallback(() => {
    if (isTrackShowed) {
      dispatch(hideVesselTrack(vesselCompositeIdentifier))
    }
    dispatch(showVessel(favorite, false, true))
  }, [dispatch, isTrackShowed, vesselCompositeIdentifier, favorite])

  return (
    <Wrapper>
      <Item isLastItem={isLastItem}>
        <Flag rel="preload" src={`flags/${favorite.flagState.toLowerCase()}.svg`} />
        <Text data-cy="favorite-vessel-name" title={favorite.vesselName ?? undefined}>
          {favorite.vesselName}
        </Text>
        {isVesselShowed ? (
          <PaperDarkIcon
            data-cy="favorite-vessel-close-vessel-sidebar"
            onClick={() => dispatch(unselectVessel())}
            title="Fermer la fiche navire"
          />
        ) : (
          <PaperIcon
            data-cy="favorite-vessel-show-vessel-sidebar"
            onClick={showVesselSidebar}
            title="Afficher la fiche navire"
          />
        )}
        {isTrackShowed || isVesselShowed ? (
          <ShowIcon
            data-cy="favorite-vessel-hide-vessel-track"
            onClick={() => {
              if (isTrackShowed) {
                dispatch(hideVesselTrack(vesselCompositeIdentifier))
              } else if (isVesselShowed) {
                dispatch(unselectVessel())
              }
            }}
            style={buttonStyle}
          />
        ) : (
          <HideIcon
            data-cy="favorite-vessel-show-vessel-track"
            onClick={() => dispatch(showVesselTrack(favorite, true, null, true))}
            style={buttonStyle}
          />
        )}
        <CloseIcon
          data-cy="favorite-vessel-delete-vessel"
          onClick={() => dispatch(removeVesselFromFavorites(vesselCompositeIdentifier))}
          style={{ marginTop: 4 }}
          title="Supprimer le navire de mes navires suivis"
        />
      </Item>
    </Wrapper>
  )
}

const buttonStyle = {
  marginTop: 4,
  paddingRight: 8
}

const Text = styled.span`
  line-height: 2.7em;
  font-size: 13px;
  padding-left: 5px;
  width: 79%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${COLORS.gunMetal};
  font-weight: 500;
`

const Item = styled.span<{
  isLastItem: boolean
}>`
  width: 100%;
  display: flex;
  user-select: none;
  border-bottom: ${p => (p.isLastItem ? 'unset' : `1px solid ${p.theme.color.lightGray}`)};
  cursor: pointer;
`

const Wrapper = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  margin: 0;
  line-height: 1.9em;
  display: block;
`
