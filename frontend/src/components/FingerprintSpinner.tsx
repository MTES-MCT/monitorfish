// https://github.com/bondz/react-epic-spinners/blob/c5b731c58edd75a93753ab95857dbc633e387fb1/src/components/FingerprintSpinner.js

import styled from 'styled-components'

import type { HTMLAttributes } from 'react'

function generateRings(num: number) {
  // eslint-disable-next-line react/no-array-index-key
  return Array.from({ length: num }).map((_val, index) => <div key={index} className="spinner-ring" />)
}

type FingerprintSpinnerProps = Readonly<
  HTMLAttributes<HTMLElement> & {
    animationDuration?: number
    color?: string
    size?: number
  }
>
export function FingerprintSpinner({
  animationDuration = 1500,
  className = '',
  color = '#fff',
  size = 60,
  ...props
}: FingerprintSpinnerProps) {
  const ringsNum = 9
  const containerPadding = 2
  const outerRingSize = size - containerPadding * 2
  const ringBase = outerRingSize / ringsNum

  return (
    <RingSpinner
      $animationDuration={animationDuration}
      $color={color}
      $containerPadding={containerPadding}
      $ringBase={ringBase}
      $size={size}
      className={`fingerprint-spinner${className ? ` ${className}` : ''}`}
      {...props}
    >
      {generateRings(ringsNum)}
    </RingSpinner>
  )
}

const RingSpinner = styled.div<{
  $animationDuration: number
  $color: string
  $containerPadding: number
  $ringBase: number
  $size: number
}>`
  height: ${props => props.$size}px;
  width: ${props => props.$size}px;
  padding: ${props => props.$containerPadding}px;
  overflow: hidden;
  position: relative;

  * {
    box-sizing: border-box;
  }

  .spinner-ring {
    position: absolute;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: ${props => props.$color};
    animation: fingerprint-spinner-animation ${props => props.$animationDuration}ms
      cubic-bezier(0.68, -0.75, 0.265, 1.75) infinite forwards;
    margin: auto;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }
  .spinner-ring:nth-child(1) {
    height: ${props => props.$ringBase + 0 * props.$ringBase}px;
    width: ${props => props.$ringBase + 0 * props.$ringBase}px;
    animation-delay: calc(50ms * 1);
  }
  .spinner-ring:nth-child(2) {
    height: ${props => props.$ringBase + 1 * props.$ringBase}px;
    width: ${props => props.$ringBase + 1 * props.$ringBase}px;
    animation-delay: calc(50ms * 2);
  }
  .spinner-ring:nth-child(3) {
    height: ${props => props.$ringBase + 2 * props.$ringBase}px;
    width: ${props => props.$ringBase + 2 * props.$ringBase}px;
    animation-delay: calc(50ms * 3);
  }
  .spinner-ring:nth-child(4) {
    height: ${props => props.$ringBase + 3 * props.$ringBase}px;
    width: ${props => props.$ringBase + 3 * props.$ringBase}px;
    animation-delay: calc(50ms * 4);
  }
  .spinner-ring:nth-child(5) {
    height: ${props => props.$ringBase + 4 * props.$ringBase}px;
    width: ${props => props.$ringBase + 4 * props.$ringBase}px;
    animation-delay: calc(50ms * 5);
  }
  .spinner-ring:nth-child(6) {
    height: ${props => props.$ringBase + 5 * props.$ringBase}px;
    width: ${props => props.$ringBase + 5 * props.$ringBase}px;
    animation-delay: calc(50ms * 6);
  }
  .spinner-ring:nth-child(7) {
    height: ${props => props.$ringBase + 6 * props.$ringBase}px;
    width: ${props => props.$ringBase + 6 * props.$ringBase}px;
    animation-delay: calc(50ms * 7);
  }
  .spinner-ring:nth-child(8) {
    height: ${props => props.$ringBase + 7 * props.$ringBase}px;
    width: ${props => props.$ringBase + 7 * props.$ringBase}px;
    animation-delay: calc(50ms * 8);
  }
  .spinner-ring:nth-child(9) {
    height: ${props => props.$ringBase + 8 * props.$ringBase}px;
    width: ${props => props.$ringBase + 8 * props.$ringBase}px;
    animation-delay: calc(50ms * 9);
  }

  @keyframes fingerprint-spinner-animation {
    100% {
      transform: rotate(360deg);
    }
  }
`
