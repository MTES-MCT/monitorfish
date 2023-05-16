import { useKey, usePrevious } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { AirControlForm } from './AirControlForm'
import { AirSurveillanceForm } from './AirSurveillanceForm'
import { LandControlForm } from './LandControlForm'
import { ObservationForm } from './ObservationForm'
import { SeaControlForm } from './SeaControlForm'
import { getInitialMissionActionFormValues } from './utils'
import { MissionAction } from '../../../../domain/types/missionAction'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendErrorBoundary } from '../../../../ui/FrontendErrorBoundary'

import type { MissionActionFormValues } from '../types'

export function ActionForm() {
  const { mission } = useMainAppSelector(store => store)

  const previousEditedDraftActionLength = usePrevious(mission.draft?.actions.length || 0)
  const previousEditedDraftActionIndex = usePrevious(mission.editedDraftActionIndex)

  const [initialMissionActionFormValues, setInitialMissionActionFormValues] = useState<
    MissionActionFormValues | undefined
  >(undefined)

  const key = useKey([mission.draft?.actions.length, mission.editedDraftActionIndex])

  useEffect(() => {
    if (
      !mission.draft ||
      (mission.editedDraftActionIndex === previousEditedDraftActionIndex &&
        mission.draft.actions.length === previousEditedDraftActionLength)
    ) {
      return
    }

    const nextInitialMissionActionFormValues = getInitialMissionActionFormValues(
      mission.draft.actions,
      mission.editedDraftActionIndex
    )

    setInitialMissionActionFormValues(nextInitialMissionActionFormValues)
  }, [mission.draft, mission.editedDraftActionIndex, previousEditedDraftActionIndex, previousEditedDraftActionLength])

  if (mission.editedDraftActionIndex === undefined || !initialMissionActionFormValues) {
    return <Wrapper />
  }

  return (
    <Wrapper key={key}>
      <FrontendErrorBoundary>
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.AIR_CONTROL && (
          <AirControlForm index={mission.editedDraftActionIndex} initialValues={initialMissionActionFormValues} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.AIR_SURVEILLANCE && (
          <AirSurveillanceForm index={mission.editedDraftActionIndex} initialValues={initialMissionActionFormValues} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.LAND_CONTROL && (
          <LandControlForm index={mission.editedDraftActionIndex} initialValues={initialMissionActionFormValues} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.OBSERVATION && (
          <ObservationForm index={mission.editedDraftActionIndex} initialValues={initialMissionActionFormValues} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.SEA_CONTROL && (
          <SeaControlForm index={mission.editedDraftActionIndex} initialValues={initialMissionActionFormValues} />
        )}
      </FrontendErrorBoundary>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  max-width: 33.33%;
  min-width: 33.33%;
  overflow-y: auto;
`
