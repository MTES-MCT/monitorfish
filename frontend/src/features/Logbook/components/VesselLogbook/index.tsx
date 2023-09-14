import { useCallback, useEffect, useState } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { FishingActivitiesSummary } from './FishingActivitiesSummary'
import LogbookMessages from './LogbookMessages'
import { COLORS } from '../../../../constants/constants'
import { FishingActivitiesTab, vesselsAreEquals } from '../../../../domain/entities/vessel/vessel'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { NavigateTo } from '../../constants'
import { logbookActions } from '../../slice'
import { getVesselLogbook } from '../../useCases/getVesselLogbook'

export function VesselLogbook() {
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const { fishingActivities, fishingActivitiesTab, loadingFishingActivities, nextFishingActivities, vesselIdentity } =
    useMainAppSelector(state => state.fishingActivities)

  const showedLogbookIsOutdated = vesselIdentity && !vesselsAreEquals(vesselIdentity, selectedVesselIdentity)
  const [messageTypeFilter, setMessageTypeFilter] = useState(null)

  const showMessages = useCallback(
    messageType => {
      setMessageTypeFilter(messageType)
      dispatch(logbookActions.setTab(FishingActivitiesTab.MESSAGES))
    },
    [dispatch]
  )

  const showSummary = () => {
    dispatch(logbookActions.setTab(FishingActivitiesTab.SUMMARY))
  }

  useEffect(() => {
    if (loadingFishingActivities) {
      return
    }

    if (!fishingActivities && !vesselIdentity) {
      dispatch(logbookActions.resetNextUpdate())
      dispatch(getVesselLogbook(selectedVesselIdentity, undefined, true))

      return
    }

    if (showedLogbookIsOutdated) {
      dispatch(getVesselLogbook(selectedVesselIdentity, undefined, true))
    }
  }, [
    dispatch,
    fishingActivities,
    vesselIdentity,
    loadingFishingActivities,
    selectedVesselIdentity,
    showedLogbookIsOutdated
  ])

  const updateFishingActivities = useCallback(
    _nextFishingActivities => {
      if (!_nextFishingActivities) {
        return
      }

      dispatch(logbookActions.setVoyage(_nextFishingActivities))
      dispatch(logbookActions.resetNextUpdate())
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

  if (loadingFishingActivities) {
    return <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
  }

  if (!fishingActivities) {
    return <NoFishingActivities data-cy="vessel-fishing">Ce navire n’a pas envoyé de message JPE.</NoFishingActivities>
  }

  return (
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
  )
}

const NoFishingActivities = styled.div`
  padding: 50px 5px 0px 5px;
  margin: 10px 10px;
  height: 70px;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  text-align: center;
`

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
