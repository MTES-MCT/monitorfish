import { usePrevious } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import FishingActivitiesSummary from './FishingActivitiesSummary'
import LogbookMessages from './logbook_messages/LogbookMessages'
import { COLORS } from '../../../constants/constants'
import { FishingActivitiesTab, vesselsAreEquals } from '../../../domain/entities/vessel/vessel'
import {
  resetNextFishingActivities,
  setFishingActivitiesTab,
  setVoyage
} from '../../../domain/shared_slices/FishingActivities'
import { getVesselLogbook, NavigateTo } from '../../../domain/use_cases/vessel/getVesselLogbook'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

export function VesselFishingActivities() {
  const dispatch = useMainAppDispatch()
  const { selectedVessel, selectedVesselIdentity } = useMainAppSelector(state => state.vessel)
  const { fishingActivities, fishingActivitiesTab, loadingFishingActivities, nextFishingActivities } =
    useMainAppSelector(state => state.fishingActivities)

  const previousSelectedVessel = usePrevious(selectedVessel)
  const [messageTypeFilter, setMessageTypeFilter] = useState(null)
  const [processingMessagesResume, setProcessingMessagesResume] = useState(false)

  const showMessages = useCallback(
    messageType => {
      setMessageTypeFilter(messageType)
      dispatch(setFishingActivitiesTab(FishingActivitiesTab.MESSAGES))
    },
    [dispatch]
  )

  const showSummary = () => {
    dispatch(setFishingActivitiesTab(FishingActivitiesTab.SUMMARY))
  }

  useEffect(() => {
    if (loadingFishingActivities) {
      return
    }

    if (!fishingActivities) {
      dispatch(resetNextFishingActivities())
      dispatch(getVesselLogbook(selectedVesselIdentity, undefined, true))

      return
    }

    if (previousSelectedVessel && !vesselsAreEquals(previousSelectedVessel, selectedVesselIdentity)) {
      dispatch(getVesselLogbook(selectedVesselIdentity, undefined, true))
    }
  }, [dispatch, fishingActivities, loadingFishingActivities, selectedVesselIdentity, previousSelectedVessel])

  const updateFishingActivities = useCallback(
    _nextFishingActivities => {
      if (!_nextFishingActivities) {
        return
      }

      dispatch(setVoyage(_nextFishingActivities))
      dispatch(resetNextFishingActivities())
    },
    [dispatch]
  )

  const goToPreviousTrip = useCallback(() => {
    dispatch(getVesselLogbook(selectedVesselIdentity, NavigateTo.PREVIOUS, true))
  }, [dispatch, selectedVesselIdentity])

  const goToNextTrip = useCallback(() => {
    dispatch(getVesselLogbook(selectedVesselIdentity, NavigateTo.NEXT, true))
  }, [dispatch, selectedVesselIdentity])

  const goToLastTrip = useCallback(() => {
    dispatch(getVesselLogbook(selectedVesselIdentity, NavigateTo.LAST, true))
  }, [dispatch, selectedVesselIdentity])

  return (
    <>
      {!loadingFishingActivities && !processingMessagesResume ? (
        <Wrapper className="smooth-scroll" data-cy="vessel-fishing">
          {nextFishingActivities && (
            <>
              <UpdateFishingActivities />
              <UpdateFishingActivitiesButton onClick={() => updateFishingActivities(nextFishingActivities)}>
                Nouveaux messages JPE
              </UpdateFishingActivitiesButton>
            </>
          )}
          {fishingActivitiesTab === FishingActivitiesTab.SUMMARY && (
            <FishingActivitiesSummary
              navigation={{
                goToLastTrip,
                goToNextTrip,
                goToPreviousTrip
              }}
              setProcessingMessagesResume={setProcessingMessagesResume}
              showLogbookMessages={showMessages}
            />
          )}
          {fishingActivitiesTab === FishingActivitiesTab.MESSAGES && (
            <LogbookMessages
              messageTypeFilter={messageTypeFilter}
              navigation={{
                goToLastTrip,
                goToNextTrip,
                goToPreviousTrip
              }}
              showFishingActivitiesSummary={showSummary}
            />
          )}
        </Wrapper>
      ) : (
        <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
      )}
    </>
  )
}

const Wrapper = styled.div`
  overflow-x: hidden;
  max-height: 700px;
`

const UpdateFishingActivities = styled.div`
  background: ${COLORS.white};
  position: absolute;
  opacity: 0.7;
  position: absolute;
  width: -moz-available;
  width: -webkit-fill-available;
  height: 55px;
  box-shadow: -10px 5px 7px 0px rgba(81, 81, 81, 0.2);
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
      -webkit-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
    }
    70% {
      -webkit-box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
    }
    100% {
      -webkit-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
    }
  }
  @keyframes pulse {
    0% {
      -moz-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
      box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
    }
    70% {
      -moz-box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
      box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
    }
    100% {
      -moz-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
      box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
    }
  }
`
