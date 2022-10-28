import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import {
  hideFishingActivitiesOnMap,
  showFishingActivitiesOnMap
} from '../../../../domain/shared_slices/FishingActivities'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { ReactComponent as ShowFishingActivitiesSVG } from '../../../icons/Bouton_afficher_messages_JPE_sur_piste.svg'

function ShowFishingActivitiesOnMap({ sidebarIsOpen }) {
  const dispatch = useDispatch()
  const { healthcheckTextWarning, rightMenuIsOpen } = useSelector(state => state.global)
  const {
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    areFishingActivitiesShowedOnMap,
    fishingActivitiesShowedOnMap
  } = useSelector(state => state.fishingActivities)

  useEffect(() => {
    if (!sidebarIsOpen) {
      dispatch(hideFishingActivitiesOnMap())
    }
  }, [sidebarIsOpen])

  return (
    <ShowFishingActivitiesOnMapButton
      data-cy="show-all-fishing-activities-on-map"
      fishingActivitiesShowedOnMap={areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length}
      healthcheckTextWarning={healthcheckTextWarning}
      onClick={() =>
        areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length
          ? dispatch(hideFishingActivitiesOnMap())
          : dispatch(showFishingActivitiesOnMap())
      }
      rightMenuIsOpen={rightMenuIsOpen}
      sidebarIsOpen={sidebarIsOpen}
      title={`${
        areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length ? 'Cacher' : 'Afficher'
      } les messages du JPE sur la piste`}
    >
      <ShowFishingActivities />
    </ShowFishingActivitiesOnMapButton>
  )
}

const ShowFishingActivitiesOnMapButton = styled(MapButtonStyle)`
  top: 258px;
  height: 30px;
  width: 30px;
  background: ${props => (props.fishingActivitiesShowedOnMap ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  position: absolute;
  margin-right: ${props => (props.sidebarIsOpen ? 505 : -45)}px;
  right: ${props => (props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10)}px;
  opacity: ${props => (props.sidebarIsOpen ? 1 : 0)};
  ${props => (props.isClickable ? 'cursor: pointer;' : null)}
  border-radius: 1px;
  z-index: 999;
  transition: all 0.5s, right 0.3s;

  :hover,
  :focus {
    background: ${props => (props.fishingActivitiesShowedOnMap ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  }
`

const ShowFishingActivities = styled(ShowFishingActivitiesSVG)`
  width: 30px;
`

export default ShowFishingActivitiesOnMap
