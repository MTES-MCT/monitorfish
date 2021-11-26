import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import FishingActivitiesSummary from './FishingActivitiesSummary'
import ERSMessages from './ers_messages/ERSMessages'
import { COLORS } from '../../../constants/constants'
import {
  resetNextFishingActivities,
  setFishingActivitiesTab,
  setVoyage
} from '../../../domain/shared_slices/FishingActivities'
import { batch, useDispatch, useSelector } from 'react-redux'
import getVesselVoyage, { NAVIGATE_TO } from '../../../domain/use_cases/getVesselVoyage'
import { FingerprintSpinner } from 'react-epic-spinners'
import { usePrevious } from '../../../hooks/usePrevious'
import { FishingActivitiesTab, vesselsAreEquals } from '../../../domain/entities/vessel'

const VesselFishingActivities = () => {
  const dispatch = useDispatch()
  const {
    selectedVesselIdentity,
    selectedVessel
  } = useSelector(state => state.vessel)

  const {
    fishingActivities,
    nextFishingActivities,
    fishingActivitiesTab,
    loadingFishingActivities
  } = useSelector(state => state.fishingActivities)

  const previousSelectedVessel = usePrevious(selectedVessel)
  const [messageTypeFilter, setMessageTypeFilter] = useState(null)
  const [processingMessagesResume, setProcessingMessagesResume] = useState(false)

  const showMessages = messageType => {
    if (messageType) {
      setMessageTypeFilter(messageType)
    } else {
      setMessageTypeFilter(null)
    }
    dispatch(setFishingActivitiesTab(FishingActivitiesTab.MESSAGES))
  }

  const showSummary = () => {
    dispatch(setFishingActivitiesTab(FishingActivitiesTab.SUMMARY))
  }

  useEffect(() => {
    if (selectedVesselIdentity) {
      if (!fishingActivities) {
        dispatch(getVesselVoyage(selectedVesselIdentity, null, false))
      }

      if (previousSelectedVessel && !vesselsAreEquals(previousSelectedVessel, selectedVessel)) {
        dispatch(getVesselVoyage(selectedVesselIdentity, null, false))
      }
    }
  }, [selectedVessel])

  useEffect(() => {
    if (fishingActivities) {
      dispatch(resetNextFishingActivities())
    }
  }, [fishingActivities])

  const updateFishingActivities = nextFishingActivities => {
    if (nextFishingActivities) {
      batch(() => {
        dispatch(setVoyage(nextFishingActivities))
        dispatch(resetNextFishingActivities())
      })
    }
  }

  function goToPreviousTrip () {
    dispatch(getVesselVoyage(selectedVesselIdentity, NAVIGATE_TO.PREVIOUS, false))
  }

  function goToNextTrip () {
    dispatch(getVesselVoyage(selectedVesselIdentity, NAVIGATE_TO.NEXT, false))
  }

  function goToLastTrip () {
    dispatch(getVesselVoyage(selectedVesselIdentity, NAVIGATE_TO.LAST, false))
  }

  return <>
    { !loadingFishingActivities && !processingMessagesResume
      ? <Wrapper data-cy={'vessel-fishing'}>
        {
          nextFishingActivities
            ? <>
              <UpdateFishingActivities/>
              <UpdateFishingActivitiesButton
                onClick={() => updateFishingActivities(nextFishingActivities)}>
                Nouveaux messages JPE
              </UpdateFishingActivitiesButton>
            </>
            : null
        }
        {
          fishingActivitiesTab === FishingActivitiesTab.SUMMARY
            ? <FishingActivitiesSummary
              showERSMessages={showMessages}
              navigation={{
                goToPreviousTrip,
                goToNextTrip,
                goToLastTrip
              }}
              setProcessingMessagesResume={setProcessingMessagesResume}
            />
            : null
        }
        {
          fishingActivitiesTab === FishingActivitiesTab.MESSAGES
            ? <ERSMessages
              showFishingActivitiesSummary={showSummary}
              messageTypeFilter={messageTypeFilter}
              navigation={{
                goToPreviousTrip,
                goToNextTrip,
                goToLastTrip
              }}
            />
            : null
        }
      </Wrapper>
      : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
    }
  </>
}

const Wrapper = styled.div`
  overflow-x: hidden;
  max-height: 700px;
`

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
  background: ${COLORS.charcoal};
  border-radius: 15px;
  font-size: 13px;
  color: ${COLORS.gainsboro};
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
