import styled from 'styled-components'

import type { ReactNode, HTMLProps } from 'react'

type MapButtonType = {
  children: ReactNode
  isHidden?: boolean | undefined
} & HTMLProps<HTMLButtonElement>
export function MapButton({ children, isHidden, ...props }: MapButtonType) {
  return (
    /**
     * TODO We have this error without the `ts-ignore` :
     *  "TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children,
     *   but only a single child was provided"
     */
    /* eslint-disable react/jsx-props-no-spreading */
    // @ts-ignore
    <Wrapper isHidden={isHidden} {...props}>
      {children}
    </Wrapper>
    /* eslint-enable react/jsx-props-no-spreading */
  )
}

const Wrapper = styled.button<{
  isHidden?: boolean | undefined
}>`
  visibility: ${p => (p.isHidden ? 'hidden' : 'visible')};
`
