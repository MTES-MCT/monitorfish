import React, { useEffect } from 'react'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as ShowFishingActivitiesSVG } from '../../../icons/Bouton_afficher_messages_JPE_sur_piste.svg'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { useDispatch, useSelector } from 'react-redux'
import { hideFishingActivitiesOnMap, showFishingActivitiesOnMap } from '../../../../domain/shared_slices/FishingActivities'

const ShowFishingActivitiesOnMap = ({ sidebarIsOpen }) => {
  const dispatch = useDispatch()
  const {
    healthcheckTextWarning,
    rightMenuIsOpen
  } = useSelector(state => state.global)
  const {
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap,
    fishingActivitiesAreShowedOnMap
  } = useSelector(state => state.fishingActivities)

  useEffect(() => {
    if (!sidebarIsOpen) {
      dispatch(hideFishingActivitiesOnMap())
    }
  }, [sidebarIsOpen])

  return (
    <ShowFishingActivitiesOnMapButton
      title={`${fishingActivitiesAreShowedOnMap || fishingActivitiesShowedOnMap?.length ? 'Cacher' : 'Afficher'} les messages du JPE sur la piste`}
      data-cy={'show-all-fishing-activities-on-map'}
      healthcheckTextWarning={healthcheckTextWarning}
      fishingActivitiesShowedOnMap={fishingActivitiesAreShowedOnMap || fishingActivitiesShowedOnMap?.length}
      sidebarIsOpen={sidebarIsOpen}
      rightMenuIsOpen={rightMenuIsOpen}
      onClick={() => fishingActivitiesAreShowedOnMap || fishingActivitiesShowedOnMap?.length
        ? dispatch(hideFishingActivitiesOnMap())
        : dispatch(showFishingActivitiesOnMap())
      }
    >
      <ShowFishingActivities />
    </ShowFishingActivitiesOnMapButton>
  )
}

const ShowFishingActivitiesOnMapButton = styled(MapButtonStyle)`
  top: 258px;
  height: 30px;
  width: 30px;
  background: ${props => props.fishingActivitiesShowedOnMap ? COLORS.shadowBlue : COLORS.charcoal};
  position: absolute;
  margin-right: ${props => props.sidebarIsOpen ? 505 : -45}px;
  right: ${props => props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10}px;
  opacity: ${props => props.sidebarIsOpen ? 1 : 0};
  ${props => props.isClickable ? 'cursor: pointer;' : null}
  border-radius: 1px;
  z-index: 999;
  transition: all 0.5s, right 0.3s;

  :hover, :focus {
      background: ${props => props.fishingActivitiesShowedOnMap ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const ShowFishingActivities = styled(ShowFishingActivitiesSVG)`
  width: 30px;
`

export default ShowFishingActivitiesOnMap
