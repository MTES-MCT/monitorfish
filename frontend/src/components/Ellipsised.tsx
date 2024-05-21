import styled from 'styled-components'

import type { HTMLAttributes } from 'react'

type EllipsisedProps = Readonly<
  HTMLAttributes<HTMLDivElement> & {
    maxWidth?: number | undefined
  }
>
export function Ellipsised({ children, maxWidth, ...props }: EllipsisedProps) {
  const title = ['number', 'string'].includes(typeof children) ? String(children).trim() : undefined

  return (
    <Box $maxWidth={maxWidth} title={title} {...props}>
      {children}
    </Box>
  )
}

export const Box = styled.div<{
  $maxWidth: number | undefined
}>`
  max-width: ${p => `${p.$maxWidth}px` ?? '100%'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
