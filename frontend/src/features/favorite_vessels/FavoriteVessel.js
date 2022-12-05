import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { showVesselTrack } from '../../domain/use_cases/vessel/showVesselTrack'
import { hideVesselTrack } from '../../domain/use_cases/vessel/hideVesselTrack'
import { removeVesselFromFavorites } from '../../domain/shared_slices/FavoriteVessel'
import { useDispatch } from 'react-redux'
import { Flag } from '../vessel_list/tableCells'
import { ShowIcon } from '../commonStyles/icons/ShowIcon.style'
import { HideIcon } from '../commonStyles/icons/HideIcon.style'
import { CloseIcon } from '../commonStyles/icons/CloseIcon.style'
import { PaperDarkIcon, PaperIcon } from '../commonStyles/icons/REGPaperIcon.style'
import { showVessel } from '../../domain/use_cases/vessel/showVessel'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { getVesselVoyage } from '../../domain/use_cases/vessel/getVesselVoyage'

const FavoriteVessel = props => {
  const {
    /** {VesselIdentity} */
    favorite,
    /** {VesselCompositeIdentifier} vesselCompositeIdentifier */
    vesselCompositeIdentifier,
    trackIsShowed,
    vesselIsShowed,
    isLastItem
  } = props
  const dispatch = useDispatch()

  return (
    <Wrapper>
      <Item isLastItem={isLastItem}>
        <Flag rel="preload" src={`flags/${favorite.flagState.toLowerCase()}.svg`}/>
        <Text
          data-cy={'favorite-vessel-name'}
          title={favorite.vesselName}>
          {favorite.vesselName}
        </Text>
        {
          vesselIsShowed
            ? <PaperDarkIcon
              data-cy={'favorite-vessel-close-vessel-sidebar'}
              title="Fermer la fiche navire"
              onClick={() => dispatch(unselectVessel(true))}
            />
            : <PaperIcon
              data-cy={'favorite-vessel-show-vessel-sidebar'}
              title="Afficher la fiche navire"
              onClick={() => {
                if (trackIsShowed) {
                  dispatch(hideVesselTrack(vesselCompositeIdentifier))
                }
                dispatch(showVessel(favorite))
                dispatch(getVesselVoyage(favorite, null, false))
              }}
            />
        }
        {
          trackIsShowed || vesselIsShowed
            ? <ShowIcon
              data-cy={'favorite-vessel-hide-vessel-track'}
              style={buttonStyle}
              title="Cacher la piste"
              onClick={() => {
                if (trackIsShowed) {
                  dispatch(hideVesselTrack(vesselCompositeIdentifier))
                } else if (vesselIsShowed) {
                  dispatch(unselectVessel())
                }
              }}
            />
            : <HideIcon
              data-cy={'favorite-vessel-show-vessel-track'}
              style={buttonStyle}
              title="Afficher la piste"
              onClick={() => dispatch(showVesselTrack(favorite, false, null, true))}
            />
        }
        <CloseIcon
          data-cy={'favorite-vessel-delete-vessel'}
          style={{ marginTop: 4 }}
          title="Supprimer le navire de mes navires suivis"
          onClick={() => dispatch(removeVesselFromFavorites(vesselCompositeIdentifier))}
        />
      </Item>
    </Wrapper>
  )
}

const buttonStyle = {
  marginTop: 3
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
  ${props => (!props.isOpen && props.isLastItem) ? null : `border-bottom: 1px solid ${COLORS.lightGray};`}
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
