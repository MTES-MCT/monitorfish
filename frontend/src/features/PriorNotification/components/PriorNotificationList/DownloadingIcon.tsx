import styled, { keyframes } from 'styled-components'

import type { IconProps } from '@mtes-mct/monitor-ui'

export function DownloadingIcon({ color, size = 20 }: IconProps) {
  return <Spinner $color={color} $size={size} aria-hidden data-cy="prior-notification-list-downloading-icon" />
}

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`
const Spinner = styled.span<{
  $color: string | undefined
  $size: number
}>`
  animation: ${rotate} 1s linear infinite;
  border: 2px solid ${p => p.$color ?? 'currentColor'};
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  display: inline-block;
  height: ${p => p.$size}px;
  width: ${p => p.$size}px;
`
