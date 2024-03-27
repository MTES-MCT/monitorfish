import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash'
import styled from 'styled-components'

export function ButtonsGroupRow({ id }) {
  return (
    <ButtonsGroup>
      <IconButton accent={Accent.TERTIARY} Icon={Icon.ViewOnMap} onClick={() => noop(id)} />
      <IconButton accent={Accent.TERTIARY} Icon={Icon.Display} onClick={() => noop(id)} />
    </ButtonsGroup>
  )
}

const ButtonsGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 2px;
  position: relative;

  > button {
    padding: 0px;
  }
`
