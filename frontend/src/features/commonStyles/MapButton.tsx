import styled from 'styled-components'

import { useMainAppSelector } from '../../hooks/useMainAppSelector'

import type { ReactNode, HTMLProps } from 'react'

type MapButtonType = {
  children: ReactNode
  dataCy?: string | undefined
  isHidden?: boolean | undefined
} & HTMLProps<HTMLButtonElement>
export function MapButton({ children, dataCy, isHidden, ...props }: MapButtonType) {
  const { healthcheckTextWarning } = useMainAppSelector(state => state.global)

  return (
    <Wrapper
      className={props.className}
      data-cy={dataCy}
      hasHealthcheckTextWarning={!!healthcheckTextWarning.length}
      isHidden={isHidden}
      onClick={props.onClick}
      style={props.style}
      title={props.title}
    >
      {children}
    </Wrapper>
  )
}

const Wrapper = styled.button<{
  hasHealthcheckTextWarning?: boolean | undefined
  isHidden?: boolean | undefined
}>`
  margin-top: ${p => (p.hasHealthcheckTextWarning ? 50 : 0)}px;
  visibility: ${p => (p.isHidden ? 'hidden' : 'visible')};
`
