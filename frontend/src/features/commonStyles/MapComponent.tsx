import styled from 'styled-components'

import type { ReactNode } from 'react'

type MapComponentStyleType = {
  children: ReactNode
  className?: string
  isHidden?: boolean | undefined
}
export function MapComponent({ children, className, isHidden, ...props }: MapComponentStyleType) {
  return (
    <Wrapper
      className={className}
      isHidden={isHidden}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...props}
    >
      {children}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  isHidden?: boolean | undefined
}>`
  visibility: ${p => (p.isHidden ? 'hidden' : 'visible')};
`
