import { FIVE_MINUTES } from '@api/APIWorker'
import { FingerprintSpinner } from '@components/FingerprintSpinner'
import { NavigateTo } from '@features/Logbook/constants'
import { FishingActivitiesTab, vesselsAreEquals } from '@features/Vessel/types/vessel'
import { updateVesselTrackAndLogbookFromTrip } from '@features/Vessel/useCases/updateVesselTrackAndLogbookFromTrip'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessages } from './LogbookMessages'
import { LogbookSummary } from './LogbookSummary'
import { logbookActions } from '../../slice'

import type { Logbook } from '@features/Logbook/Logbook.types'

export function VesselLogbook() {
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const {
    fishingActivities,
    fishingActivitiesTab,
    isLastVoyage,
    loadingFishingActivities,
    nextFishingActivities,
    vesselIdentity
  } = useMainAppSelector(state => state.fishingActivities)

  const showedLogbookIsOutdated = vesselIdentity && !vesselsAreEquals(vesselIdentity, selectedVesselIdentity)
  const [messageTypeFilter, setMessageTypeFilter] = useState<string | undefined>(undefined)

  // TODO This need to be moved to a RTK-Query's `pollingInterval`
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLastVoyage) {
        dispatch(updateVesselTrackAndLogbookFromTrip(selectedVesselIdentity, NavigateTo.LAST, false))
      }
    }, FIVE_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, isLastVoyage, selectedVesselIdentity])

  const showMessages = useCallback(
    (messageType: string | undefined) => {
      setMessageTypeFilter(messageType)
      dispatch(logbookActions.setTab(FishingActivitiesTab.MESSAGES))
    },
    [dispatch]
  )

  useEffect(() => {
    if (loadingFishingActivities) {
      return
    }

    if (showedLogbookIsOutdated) {
      dispatch(updateVesselTrackAndLogbookFromTrip(selectedVesselIdentity, undefined, true))
    }
  }, [
    dispatch,
    fishingActivities,
    vesselIdentity,
    loadingFishingActivities,
    selectedVesselIdentity,
    showedLogbookIsOutdated
  ])

  const updateFishingActivities = (_nextFishingActivities: Logbook.FishingActivities) => {
    if (!_nextFishingActivities) {
      return
    }

    dispatch(logbookActions.setFishingActivities(_nextFishingActivities))
    dispatch(logbookActions.resetNextUpdate())
  }

  if (loadingFishingActivities) {
    return <FingerprintSpinner className="radar" color={THEME.color.charcoal} size={100} />
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
      {fishingActivitiesTab === FishingActivitiesTab.SUMMARY && <LogbookSummary showLogbookMessages={showMessages} />}
      {fishingActivitiesTab === FishingActivitiesTab.MESSAGES && (
        <LogbookMessages messageTypeFilter={messageTypeFilter} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div``

const UpdateFishingActivities = styled.div`
  background: ${p => p.theme.color.white};
  position: absolute;
  opacity: 0.7;
  position: absolute;
  width: -moz-available;
  width: -webkit-fill-available;
  height: 55px;
  box-shadow: -10px 5px 7px 0 rgba(81, 81, 81, 0.2);
  z-index: 9;
`

const UpdateFishingActivitiesButton = styled.div`
  background: ${p => p.theme.color.charcoal};
  border-radius: 15px;
  font-size: 13px;
  color: ${p => p.theme.color.gainsboro};
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
