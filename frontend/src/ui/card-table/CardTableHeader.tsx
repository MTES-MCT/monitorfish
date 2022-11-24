import { List } from 'rsuite'
import styled, { css } from 'styled-components'

import { COLORS } from '../../constants/constants'

import type { ReactNode } from 'react'

type CardTableHeaderProps = {
  children: ReactNode
  noPadding?: boolean
}
export function CardTableHeader({ children, noPadding = false }: CardTableHeaderProps) {
  return (
    <StyledCardTableHeader key={0} $noPadding={noPadding} index={0}>
      {children}
    </StyledCardTableHeader>
  )
}

const StyledCardTableHeader = styled(List.Item)<{
  $noPadding: boolean
}>`
  background: ${COLORS.white};
  border: 1px solid ${COLORS.lightGray};
  border-radius: 1px;
  color: ${COLORS.slateGray};
  height: ${p => (p.$noPadding ? 'auto' : '15px')};
  overflow: hidden;
  transition: background 3s;
  user-select: none;

  ${p =>
    p.$noPadding &&
    css`
      padding: 0;
    `}
`
