import { useKey, usePrevious } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { AirControlForm } from './AirControlForm'
import { AirSurveillanceForm } from './AirSurveillanceForm'
import { LandControlForm } from './LandControlForm'
import { ObservationForm } from './ObservationForm'
import { SeaControlForm } from './SeaControlForm'
import { getInitialMissionActionFormValues } from './utils'
import { missionActions } from '../../../../domain/actions'
import { MissionAction } from '../../../../domain/types/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendErrorBoundary } from '../../../../ui/FrontendErrorBoundary'

import type { MissionActionFormValues } from '../types'

export function ActionForm() {
  const { mission } = useMainAppSelector(store => store)
  const dispatch = useMainAppDispatch()

  const editedDraftAction =
    mission.draft && mission.editedDraftActionIndex !== undefined
      ? mission.draft.actions[mission.editedDraftActionIndex]
      : undefined
  const previousEditedDraftActionLength = usePrevious(mission.draft?.actions.length || 0)
  const previousEditedDraftActionIndex = usePrevious(mission.editedDraftActionIndex)

  const [initialMissionActionFormValues, setInitialMissionActionFormValues] = useState<
    MissionActionFormValues | undefined
  >(undefined)

  const key = useKey([mission.editedDraftActionIndex])

  const handleChange = useDebouncedCallback((nextMissionActionFormValues: MissionActionFormValues) => {
    // There is a delay here: we don't want to update an edited draft action that may have been just deleted
    if (mission.editedDraftActionIndex === undefined) {
      return
    }

    dispatch(missionActions.setEditedDraftAction(nextMissionActionFormValues))
  }, 500)

  useEffect(() => {
    if (
      !mission.draft ||
      (mission.editedDraftActionIndex === previousEditedDraftActionIndex &&
        mission.draft.actions.length === previousEditedDraftActionLength)
    ) {
      return
    }

    const nextInitialMissionActionFormValues = getInitialMissionActionFormValues(
      mission.draft?.actions,
      mission.editedDraftActionIndex
    )

    setInitialMissionActionFormValues(nextInitialMissionActionFormValues)
  }, [
    editedDraftAction,
    mission.draft,
    mission.editedDraftActionIndex,
    previousEditedDraftActionIndex,
    previousEditedDraftActionLength
  ])

  if (!initialMissionActionFormValues) {
    return <Wrapper />
  }

  return (
    <Wrapper key={key}>
      <FrontendErrorBoundary>
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.AIR_CONTROL && (
          <AirControlForm initialValues={initialMissionActionFormValues} onChange={handleChange} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.AIR_SURVEILLANCE && (
          <AirSurveillanceForm initialValues={initialMissionActionFormValues} onChange={handleChange} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.LAND_CONTROL && (
          <LandControlForm initialValues={initialMissionActionFormValues} onChange={handleChange} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.OBSERVATION && (
          <ObservationForm initialValues={initialMissionActionFormValues} onChange={handleChange} />
        )}
        {initialMissionActionFormValues.actionType === MissionAction.MissionActionType.SEA_CONTROL && (
          <SeaControlForm initialValues={initialMissionActionFormValues} onChange={handleChange} />
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
