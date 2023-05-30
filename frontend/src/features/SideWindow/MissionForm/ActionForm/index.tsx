import { memo } from 'react'
import styled from 'styled-components'

import { AirControlForm } from './AirControlForm'
import { AirSurveillanceForm } from './AirSurveillanceForm'
import { LandControlForm } from './LandControlForm'
import { ObservationForm } from './ObservationForm'
import { SeaControlForm } from './SeaControlForm'
import { MissionAction } from '../../../../domain/types/missionAction'
import { FrontendErrorBoundary } from '../../../../ui/FrontendErrorBoundary'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type ActionFormProps = {
  initialActionFormValues: MissionActionFormValues | undefined
  onChange: (nextActionFormValues: MissionActionFormValues) => Promisable<void>
}
function UnmemoizedActionForm({ initialActionFormValues, onChange }: ActionFormProps) {
  if (!initialActionFormValues) {
    return <Wrapper />
  }

  return (
    <Wrapper>
      <FrontendErrorBoundary>
        {initialActionFormValues.actionType === MissionAction.MissionActionType.AIR_CONTROL && (
          <AirControlForm initialValues={initialActionFormValues} onChange={onChange} />
        )}
        {initialActionFormValues.actionType === MissionAction.MissionActionType.AIR_SURVEILLANCE && (
          <AirSurveillanceForm initialValues={initialActionFormValues} onChange={onChange} />
        )}
        {initialActionFormValues.actionType === MissionAction.MissionActionType.LAND_CONTROL && (
          <LandControlForm initialValues={initialActionFormValues} onChange={onChange} />
        )}
        {initialActionFormValues.actionType === MissionAction.MissionActionType.OBSERVATION && (
          <ObservationForm initialValues={initialActionFormValues} onChange={onChange} />
        )}
        {initialActionFormValues.actionType === MissionAction.MissionActionType.SEA_CONTROL && (
          <SeaControlForm initialValues={initialActionFormValues} onChange={onChange} />
        )}
      </FrontendErrorBoundary>
    </Wrapper>
  )
}

/**
 * @description
 * This component is fully memoized because we want its parent (`<MissionForm />`) to fully control
 * when to re-create this component using a `key` prop,
 * which should only happens when the user switches from one mission action to another.
 */
export const ActionForm = memo(UnmemoizedActionForm)

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  max-width: 33.33%;
  min-width: 33.33%;
  overflow-y: auto;
`
