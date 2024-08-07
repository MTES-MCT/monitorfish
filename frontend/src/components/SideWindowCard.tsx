import styled from 'styled-components'

import type { HTMLAttributes } from 'react'
import type { Promisable } from 'type-fest'

export type SideWindowCardProps = HTMLAttributes<HTMLDivElement> & {
  onBackgroundClick?: () => Promisable<void> | undefined
}
export function SideWindowCard({ children, onBackgroundClick, ...nativeProps }: SideWindowCardProps) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Box {...nativeProps}>
      <Overlay data-cy="Card-overlay" onClick={onBackgroundClick} />

      <Body>{children}</Body>
    </Box>
  )
}

const Box = styled.div`
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  left: 70px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
`

const Overlay = styled.div`
  background-color: ${p => p.theme.color.charcoal};
  opacity: 0.5;
  flex-grow: 1;
`

const Body = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 560px;
`
