import styled from 'styled-components'

import { useMainAppSelector } from '../../hooks/useMainAppSelector'

import type { ReactNode } from 'react'

type MapComponentStyleType = {
  children: ReactNode
  className?: string
  isHidden?: boolean | undefined
}
export function MapComponent({ children, className, isHidden, ...props }: MapComponentStyleType) {
  const { healthcheckTextWarning } = useMainAppSelector(state => state.global)

  return (
    <Wrapper
      className={className}
      hasHealthcheckTextWarning={!!healthcheckTextWarning.length}
      isHidden={isHidden}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...props}
    >
      {children}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  hasHealthcheckTextWarning?: boolean | undefined
  isHidden?: boolean | undefined
}>`
  margin-top: ${p => (p.hasHealthcheckTextWarning ? 50 : 0)}px;
  visibility: ${p => (p.isHidden ? 'hidden' : 'visible')};
`
