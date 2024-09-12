// https://github.com/bondz/react-epic-spinners/blob/c5b731c58edd75a93753ab95857dbc633e387fb1/src/components/FulfillingBouncingCircleSpinner.js

import styled from 'styled-components'

import type { HTMLAttributes } from 'react'

type FulfillingBouncingCircleSpinnerProps = Readonly<
  HTMLAttributes<HTMLDivElement> & {
    animationDuration?: number
    color?: string
    size?: number
  }
>
export function FulfillingBouncingCircleSpinner({
  animationDuration = 4000,
  className = '',
  color = '#fff',
  size = 60,
  ...props
}: FulfillingBouncingCircleSpinnerProps) {
  return (
    <BouncingCircle
      $animationDuration={animationDuration}
      $color={color}
      $size={size}
      className={`fulfilling-bouncing-circle-spinner${className ? ` ${className}` : ''}`}
      {...props}
    >
      <div className="circle" />
      <div className="orbit" />
    </BouncingCircle>
  )
}

const BouncingCircle = styled.div<{
  $animationDuration: number
  $color: string
  $size: number
}>`
  height: ${props => props.$size}px;
  width: ${props => props.$size}px;
  position: relative;
  animation: fulfilling-bouncing-circle-spinner-animation infinite ${props => props.$animationDuration}ms ease;

  * {
    box-sizing: border-box;
  }

  .orbit {
    height: ${props => props.$size}px;
    width: ${props => props.$size}px;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    border: calc(${props => props.$size}px * 0.03) solid ${props => props.$color};
    animation: fulfilling-bouncing-circle-spinner-orbit-animation infinite ${props => props.$animationDuration}ms ease;
  }
  .circle {
    height: ${props => props.$size}px;
    width: ${props => props.$size}px;
    color: ${props => props.$color};
    display: block;
    border-radius: 50%;
    position: relative;
    border: calc(${props => props.$size}px * 0.1) solid ${props => props.$color};
    animation: fulfilling-bouncing-circle-spinner-circle-animation infinite ${props => props.$animationDuration}ms ease;
    transform: rotate(0deg) scale(1);
  }
  @keyframes fulfilling-bouncing-circle-spinner-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes fulfilling-bouncing-circle-spinner-orbit-animation {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1);
    }
    62.5% {
      transform: scale(0.8);
    }
    75% {
      transform: scale(1);
    }
    87.5% {
      transform: scale(0.8);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes fulfilling-bouncing-circle-spinner-circle-animation {
    0% {
      transform: scale(1);
      border-color: transparent;
      border-top-color: inherit;
    }
    16.7% {
      border-color: transparent;
      border-top-color: initial;
      border-right-color: initial;
    }
    33.4% {
      border-color: transparent;
      border-top-color: inherit;
      border-right-color: inherit;
      border-bottom-color: inherit;
    }
    50% {
      border-color: inherit;
      transform: scale(1);
    }
    62.5% {
      border-color: inherit;
      transform: scale(1.4);
    }
    75% {
      border-color: inherit;
      transform: scale(1);
      opacity: 1;
    }
    87.5% {
      border-color: inherit;
      transform: scale(1.4);
    }
    100% {
      border-color: transparent;
      border-top-color: inherit;
      transform: scale(1);
    }
  }
`
