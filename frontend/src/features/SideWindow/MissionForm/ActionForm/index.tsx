import styled from 'styled-components'

import { MissionType } from '../../../../domain/types/mission'
import { AirControl } from './AirControl'
import { FreeNote } from './FreeNote'
import { GroundControl } from './GroundControl'
import { SeaControl } from './SeaControl'

import type { PartialAction } from '../types'

export type ActionFormProps = {
  action?: PartialAction
}
export function ActionForm({ action }: ActionFormProps) {
  if (!action) {
    return <Wrapper />
  }

  return (
    <Wrapper>
      {action.type === MissionType.AIR && <AirControl action={action} />}
      {action.type === MissionType.GROUND && <GroundControl action={action} />}
      {action.type === MissionType.SEA && <SeaControl action={action} />}
      {!action.type && <FreeNote action={action} />}
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
