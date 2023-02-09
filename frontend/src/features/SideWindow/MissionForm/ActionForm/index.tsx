import styled from 'styled-components'

import { AirControlForm } from './AirControlForm'
import { AirSurveillanceForm } from './AirSurveillanceForm'
import { LandControlForm } from './LandControlForm'
import { ObservationForm } from './ObservationForm'
import { SeaControlForm } from './SeaControlForm'
import { MissionAction } from '../../../../domain/types/missionAction'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type ActionFormProps = {
  initialValues: MissionActionFormValues | undefined
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function ActionForm({ initialValues, onChange }: ActionFormProps) {
  if (!initialValues) {
    return <Wrapper />
  }

  return (
    <Wrapper>
      {initialValues.actionType === MissionAction.MissionActionType.AIR_CONTROL && (
        <AirControlForm initialValues={initialValues} onChange={onChange} />
      )}
      {initialValues.actionType === MissionAction.MissionActionType.AIR_SURVEILLANCE && (
        <AirSurveillanceForm initialValues={initialValues} onChange={onChange} />
      )}
      {initialValues.actionType === MissionAction.MissionActionType.LAND_CONTROL && (
        <LandControlForm initialValues={initialValues} onChange={onChange} />
      )}
      {initialValues.actionType === MissionAction.MissionActionType.OBSERVATION && (
        <ObservationForm initialValues={initialValues} onChange={onChange} />
      )}
      {initialValues.actionType === MissionAction.MissionActionType.SEA_CONTROL && (
        <SeaControlForm initialValues={initialValues} onChange={onChange} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 33.33%;
`
