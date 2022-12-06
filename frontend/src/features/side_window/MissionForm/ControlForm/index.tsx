import styled from 'styled-components'

import { MissionType } from '../../../../domain/types/mission'
import { Air } from './Air'
import { Sea } from './Sea'

import type { PartialAction } from '../types'

export type ControlFormProps = {
  action?: PartialAction
}
export function ControlForm({ action }: ControlFormProps) {
  if (!action) {
    return <Wrapper />
  }

  return (
    <Wrapper>
      {action.type === MissionType.AIR && <Air />}
      {action.type === MissionType.SEA && <Sea />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
  width: 33.33%;
`
