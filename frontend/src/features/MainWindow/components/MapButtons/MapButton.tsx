import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import type { HTMLProps, ReactNode } from 'react'

type MapButtonType = {
  children: ReactNode
  isHidden?: boolean | undefined
} & HTMLProps<HTMLButtonElement>
export function MapButton({ children, isHidden, ...props }: MapButtonType) {
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)

  return (
    /**
     * TODO We have this error without the `ts-ignore` :
     *  "TS2745: This JSX tag's 'children' prop expects type 'never' which requires multiple children,
     *   but only a single child was provided"
     */
    /* eslint-disable react/jsx-props-no-spreading */
    // @ts-ignore
    <Wrapper hasHealthcheckTextWarning={!!healthcheckTextWarning.length} isHidden={isHidden} {...props}>
      {children}
    </Wrapper>
    /* eslint-enable react/jsx-props-no-spreading */
  )
}

const Wrapper = styled.button<{
  hasHealthcheckTextWarning?: boolean | undefined
  isHidden?: boolean | undefined
}>`
  margin-top: ${p => (p.hasHealthcheckTextWarning ? 50 : 0)}px;
  visibility: ${p => (p.isHidden ? 'hidden' : 'visible')};
`
