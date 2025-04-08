import { useGetTopOffset } from '@hooks/useGetTopOffset'
import styled from 'styled-components'

import type { HTMLProps, ReactNode } from 'react'

type MapButtonType = {
  children: ReactNode
  isHidden?: boolean | undefined
} & HTMLProps<HTMLButtonElement>

/** @deprecated Use `MapToolButton` instead. */
export function MapButton({ children, isHidden, ...props }: MapButtonType) {
  const marginTop = useGetTopOffset()

  return (
    /**
     * TODO We have this error without the `ts-ignore` :
     *  "TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children,
     *   but only a single child was provided"
     */
    /* eslint-disable react/jsx-props-no-spreading */
    // @ts-ignore
    <Wrapper $isHidden={isHidden} $marginTop={marginTop} {...props}>
      {children}
    </Wrapper>
    /* eslint-enable react/jsx-props-no-spreading */
  )
}

const Wrapper = styled.button<{
  $isHidden?: boolean | undefined
  $marginTop: number
}>`
  padding: unset;
  margin-top: ${p => p.$marginTop}px;
  visibility: ${p => (p.$isHidden ? 'hidden' : 'visible')};
`
