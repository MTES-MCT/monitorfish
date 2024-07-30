import { Icon } from '@mtes-mct/monitor-ui'
import styled, { keyframes } from 'styled-components'

import { PriorNotification } from '../../../PriorNotification.types'
import { getColorsFromState } from '../utils'

type SendButtonCellProps = Readonly<{
  state: PriorNotification.State | undefined
}>
export function StateCell({ state }: SendButtonCellProps) {
  if (!state || state === PriorNotification.State.OUT_OF_VERIFICATION_SCOPE) {
    return <Wrapper title={state ? PriorNotification.STATE_LABEL[state] : undefined}>-</Wrapper>
  }

  return (
    <Wrapper $state={state} title={PriorNotification.STATE_LABEL[state]}>
      {!!state &&
      [PriorNotification.State.AUTO_SEND_IN_PROGRESS, PriorNotification.State.PENDING_SEND].includes(state) ? (
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
  $state?: PriorNotification.State
}>`
  align-items: center;
  background-color: ${p => getColorsFromState(p.$state).backgroundColor ?? 'transparent'};
  border-radius: 50%;
  color: ${p => getColorsFromState(p.$state).color ?? 'inherit'};
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
  border: 2px solid ${p => p.theme.color.slateGray};
  border-bottom-color: transparent;
  border-radius: 50%;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`
