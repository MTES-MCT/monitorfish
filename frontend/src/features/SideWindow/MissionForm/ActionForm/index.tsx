import styled from 'styled-components'

import { AirControl } from './AirControl'
import { FreeNote } from './FreeNote'
import { GroundControl } from './GroundControl'
import { SeaControl } from './SeaControl'
import { MissionType } from '../../../../domain/types/mission'

import type { PartialAction } from '../types'
import type { Promisable } from 'type-fest'

export type ActionFormProps = {
  action: PartialAction | undefined
  onChange: (nextNewAction: PartialAction) => Promisable<void>
}
export function ActionForm({ action, onChange }: ActionFormProps) {
  if (!action) {
    return <Wrapper />
  }

  return (
    <Wrapper>
      {action.type === MissionType.AIR && <AirControl action={action} />}
      {action.type === MissionType.LAND && <GroundControl action={action} />}
      {action.type === MissionType.SEA && <SeaControl action={action} onChange={onChange} />}
      {!action.type && <FreeNote action={action} onChange={onChange} />}
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
