import { HTMLAttributes } from 'react'
import styled from 'styled-components'

type CardTableColumnTitleProps = HTMLAttributes<HTMLDivElement> & {
  children: string
  isSortable: boolean
}
export function CardTableColumnTitle({ children, isSortable }: CardTableColumnTitleProps) {
  return <StyledCardTableColumnTitle isSortable={isSortable}>{children}</StyledCardTableColumnTitle>
}

const StyledCardTableColumnTitle = styled.div<{
  isSortable: boolean
}>`
  cursor: ${p => (p.isSortable ? 'pointer' : '')};
`
