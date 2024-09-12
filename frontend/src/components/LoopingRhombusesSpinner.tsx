// https://github.com/bondz/react-epic-spinners/blob/c5b731c58edd75a93753ab95857dbc633e387fb1/src/components/LoopingRhombusesSpinner.js

import styled from 'styled-components'

import type { HTMLAttributes } from 'react'

function generateSpinners(num: number) {
  // eslint-disable-next-line react/no-array-index-key
  return Array.from({ length: num }).map((_val, index) => <div key={index} className="rhombus" />)
}

type LoopingRhombusesSpinnerProps = Readonly<
  HTMLAttributes<HTMLElement> & {
    animationDuration?: number
    color?: string
    size?: number
  }
>
export function LoopingRhombusesSpinner({
  animationDuration = 2500,
  className = '',
  color = '#fff',
  size = 15,
  ...props
}: LoopingRhombusesSpinnerProps) {
  const num = 3

  return (
    <LoadingRhombus
      $animationDuration={animationDuration}
      $color={color}
      $size={size}
      className={`looping-rhombuses-spinner${className ? ` ${className}` : ''}`}
      {...props}
    >
      {generateSpinners(num)}
    </LoadingRhombus>
  )
}

const LoadingRhombus = styled.div<{
  $animationDuration: number
  $color: string
  $size: number
}>`
  width: ${props => props.$size * 4}px;
  height: ${props => props.$size}px;
  position: relative;

  * {
    box-sizing: border-box;
  }

  .rhombus {
    height: ${props => props.$size}px;
    width: ${props => props.$size}px;
    background-color: ${props => props.$color};
    left: ${props => props.$size * 4}px;
    position: absolute;
    margin: 0 auto;
    border-radius: 2px;
    transform: translateY(0) rotate(45deg) scale(0);
    animation: looping-rhombuses-spinner-animation ${props => props.$animationDuration}ms linear infinite;
  }
  .rhombus:nth-child(1) {
    animation-delay: calc(${props => props.$animationDuration}ms * 1 / -1.5);
  }
  .rhombus:nth-child(2) {
    animation-delay: calc(${props => props.$animationDuration}ms * 2 / -1.5);
  }
  .rhombus:nth-child(3) {
    animation-delay: calc(${props => props.$animationDuration}ms * 3 / -1.5);
  }
  @keyframes looping-rhombuses-spinner-animation {
    0% {
      transform: translateX(0) rotate(45deg) scale(0);
    }
    50% {
      transform: translateX(-233%) rotate(45deg) scale(1);
    }
    100% {
      transform: translateX(-466%) rotate(45deg) scale(0);
    }
  }
`
