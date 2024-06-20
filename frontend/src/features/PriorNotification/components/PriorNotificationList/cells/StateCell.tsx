import { Icon } from '@mtes-mct/monitor-ui'
import styled, { keyframes } from 'styled-components'

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
      {!!state && state === PriorNotification.State.PENDING_SEND ? (
        <SpinnerWrapper>
          <Icon.Send />
          <SpinnerBorder />
        </SpinnerWrapper>
      ) : (
        <Icon.Send />
      )}
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

const SpinnerWrapper = styled.div`
  align-items: center;
  display: inline-flex;
  height: 26px;
  justify-content: center;
  position: relative;
  width: 26px;
`

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`
const SpinnerBorder = styled.span`
  animation: ${rotate} 1s linear infinite;
  border: 2px solid ${p => p.theme.color.mediumSeaGreen};
  border-bottom-color: transparent;
  border-radius: 50%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`
