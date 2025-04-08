import { useGetTopOffset } from '@hooks/useGetTopOffset'
import styled from 'styled-components'

import type { ReactNode } from 'react'

type MapComponentStyleType = {
  children: ReactNode
  className?: string
  isHidden?: boolean | undefined
}
export function MapComponent({ children, className, isHidden, ...props }: MapComponentStyleType) {
  const marginTop = useGetTopOffset()

  return (
    <Wrapper
      $isHidden={isHidden}
      $marginTop={marginTop}
      className={className}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...props}
    >
      {children}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isHidden?: boolean | undefined
  $marginTop?: number
}>`
  margin-top: ${p => p.$marginTop}px;
  visibility: ${p => (p.$isHidden ? 'hidden' : 'visible')};
`
