import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { removeVesselFromFavorites } from '../../domain/shared_slices/FavoriteVessel'
import getVesselVoyage from '../../domain/use_cases/vessel/getVesselVoyage'
import hideVesselTrack from '../../domain/use_cases/vessel/hideVesselTrack'
import showVessel from '../../domain/use_cases/vessel/showVessel'
import showVesselTrack from '../../domain/use_cases/vessel/showVesselTrack'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { CloseIcon } from '../commonStyles/icons/CloseIcon.style'
import { HideIcon } from '../commonStyles/icons/HideIcon.style'
import { PaperDarkIcon, PaperIcon } from '../commonStyles/icons/REGPaperIcon.style'
import { ShowIcon } from '../commonStyles/icons/ShowIcon.style'
import { Flag } from '../vessel_list/tableCells'

function FavoriteVessel(props) {
  const {
    /** {VesselIdentity} */
    favorite,
    /** {VesselId} vesselId */
    isLastItem,
    trackIsShowed,
    vesselId,
    vesselIsShowed,
  } = props
  const dispatch = useDispatch()

  return (
    <Wrapper>
      <Item isLastItem={isLastItem}>
        <Flag rel="preload" src={`flags/${favorite.flagState.toLowerCase()}.svg`} />
        <Text data-cy="favorite-vessel-name" title={favorite.vesselName}>
          {favorite.vesselName}
        </Text>
        {vesselIsShowed ? (
          <PaperDarkIcon
            data-cy="favorite-vessel-close-vessel-sidebar"
            onClick={() => dispatch(unselectVessel(true))}
            title="Fermer la fiche navire"
          />
        ) : (
          <PaperIcon
            data-cy="favorite-vessel-show-vessel-sidebar"
            onClick={() => {
              if (trackIsShowed) {
                dispatch(hideVesselTrack(vesselId))
              }
              dispatch(showVessel(favorite))
              dispatch(getVesselVoyage(favorite, null, false))
            }}
            title="Afficher la fiche navire"
          />
        )}
        {trackIsShowed || vesselIsShowed ? (
          <ShowIcon
            data-cy="favorite-vessel-hide-vessel-track"
            onClick={() => {
              if (trackIsShowed) {
                dispatch(hideVesselTrack(vesselId))
              } else if (vesselIsShowed) {
                dispatch(unselectVessel())
              }
            }}
            style={buttonStyle}
            title="Cacher la piste"
          />
        ) : (
          <HideIcon
            data-cy="favorite-vessel-show-vessel-track"
            onClick={() => dispatch(showVesselTrack(favorite, false, null, true))}
            style={buttonStyle}
            title="Afficher la piste"
          />
        )}
        <CloseIcon
          data-cy="favorite-vessel-delete-vessel"
          onClick={() => dispatch(removeVesselFromFavorites(vesselId))}
          style={{ marginTop: 4 }}
          title="Supprimer le navire de mes navires suivis"
        />
      </Item>
    </Wrapper>
  )
}

const buttonStyle = {
  marginTop: 3,
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

const Item = styled.span`
  width: 100%;
  display: flex;
  user-select: none;
  ${props => (!props.isOpen && props.isLastItem ? null : `border-bottom: 1px solid ${COLORS.lightGray};`)}
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

export default FavoriteVessel
