import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import FishingActivitiesSummary from './FishingActivitiesSummary'
import ERSMessages from './ers_messages/ERSMessages'
import { COLORS } from '../../constants/constants'
import { resetNextFishingActivities, setVoyage } from '../../domain/reducers/Vessel'
import { useDispatch, useSelector } from 'react-redux'
import getVesselVoyage, { NAVIGATE_TO } from '../../domain/use_cases/getVesselVoyage'

const VesselFishingActivities = ({ fishingActivities, nextFishingActivities, fleetSegments, vesselLastPositionFeature }) => {
  const dispatch = useDispatch()
  const {
    selectedVesselFeatureAndIdentity
  } = useSelector(state => state.vessel)

  const [fishingViewIndex, setFishingViewIndex] = useState(1)
  const [messageTypeFilter, setMessageTypeFilter] = useState(null)

  const showERSMessages = messageType => {
    if (messageType) {
      setMessageTypeFilter(messageType)
    } else {
      setMessageTypeFilter(null)
    }
    setFishingViewIndex(2)
  }

  const showFishingActivitiesSummary = () => {
    setFishingViewIndex(1)
  }

  useEffect(() => {
    if (fishingActivities) {
      dispatch(resetNextFishingActivities())
    }
  }, [fishingActivities])

  const updateFishingActivities = nextFishingActivities => {
    if (nextFishingActivities) {
      dispatch(setVoyage(nextFishingActivities))
      dispatch(resetNextFishingActivities())
    }
  }

  function goToPreviousTrip () {
    dispatch(getVesselVoyage(selectedVesselFeatureAndIdentity.identity, NAVIGATE_TO.PREVIOUS, false))
  }

  function goToNextTrip () {
    dispatch(getVesselVoyage(selectedVesselFeatureAndIdentity.identity, NAVIGATE_TO.NEXT, false))
  }

  function goToLastTrip () {
    dispatch(getVesselVoyage(selectedVesselFeatureAndIdentity.identity, NAVIGATE_TO.LAST, false))
  }

  return <>
    {nextFishingActivities
      ? <>
        <UpdateFishingActivities/>
        <UpdateFishingActivitiesButton
          onClick={() => updateFishingActivities(nextFishingActivities)}>
          Nouveaux messages JPE
        </UpdateFishingActivitiesButton>
      </>
      : null
    }
    {fishingViewIndex === 1
      ? <FishingActivitiesSummary
        showERSMessages={showERSMessages}
        fishingActivities={fishingActivities}
        fleetSegments={fleetSegments}
        vesselLastPositionFeature={vesselLastPositionFeature}
        navigation={{
          goToPreviousTrip,
          goToNextTrip,
          goToLastTrip
        }}
      />
      : null
    }
    {fishingViewIndex === 2
      ? <ERSMessages
        showFishingActivitiesSummary={showFishingActivitiesSummary}
        fishingActivities={fishingActivities}
        messageTypeFilter={messageTypeFilter}
        navigation={{
          goToPreviousTrip,
          goToNextTrip,
          goToLastTrip
        }}
      />
      : null}
  </>
}

const UpdateFishingActivities = styled.div`
  background: ${COLORS.background};
  position: absolute;
  opacity: 0.7;
  position: absolute;
  width: -moz-available;
  width: -webkit-fill-available;
  height: 55px;
  box-shadow: -10px 5px 7px 0px rgba(81,81,81, 0.2);
  z-index: 9;
`

const UpdateFishingActivitiesButton = styled.div`
  background: ${COLORS.grayDarkerThree};
  border-radius: 15px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  position: absolute;
  padding: 5px 10px 5px 10px;
  margin-top: 13px;
  margin-left: 166px;
  cursor: pointer;
  animation: pulse 2s infinite;
  z-index: 10;
  
  @-webkit-keyframes pulse {
  0% {
    -webkit-box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
  }
  70% {
      -webkit-box-shadow: 0 0 0 10px rgba(81,81,81, 0);
  }
  100% {
      -webkit-box-shadow: 0 0 0 0 rgba(81,81,81, 0);
  }
}
@keyframes pulse {
  0% {
    -moz-box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
    box-shadow: 0 0 0 0 rgba(81,81,81, 0.4);
  }
  70% {
      -moz-box-shadow: 0 0 0 10px rgba(81,81,81, 0);
      box-shadow: 0 0 0 10px rgba(81,81,81, 0);
  }
  100% {
      -moz-box-shadow: 0 0 0 0 rgba(81,81,81, 0);
      box-shadow: 0 0 0 0 rgba(81,81,81, 0);
  }
}
`

export default VesselFishingActivities
