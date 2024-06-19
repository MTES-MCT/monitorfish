import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { PriorNotification } from '../../../PriorNotification.types'
import { getColorAndBackgroundColorFromState } from '../utils'

type SendButtonCellProps = Readonly<{
  state: PriorNotification.State | undefined
}>
export function StateCell({ state }: SendButtonCellProps) {
  const [color, backgroundColor] = getColorAndBackgroundColorFromState(state)

  if (!state || state === PriorNotification.State.OUT_OF_VERIFICATION_SCOPE) {
    return <Wrapper title={state ? PriorNotification.STATE_LABEL[state] : undefined}>-</Wrapper>
  }

  return (
    <Wrapper $backgroundColor={backgroundColor} $color={color} title={PriorNotification.STATE_LABEL[state]}>
      {!!state && state === PriorNotification.State.PENDING_SEND ? <Spinner /> : <Icon.Send />}
    </Wrapper>
  )
}

const Wrapper = styled.span<{
  $backgroundColor?: string
  $color?: string
}>`
  align-items: center;
  background-color: ${p => p.$backgroundColor ?? 'transparent'};
  border-radius: 50%;
  color: ${p => p.$color ?? 'inherit'};
  display: inline-flex;
  height: 26px;
  justify-content: center;
  padding: 0px;
  vertical-align: bottom;
  width: 26px;
`
const Spinner = styled.span`
  animation: rotation 1s linear infinite;
  border: 2px solid #707785;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  display: inline-block;
  height: 26px;
  width: 26px;
`
