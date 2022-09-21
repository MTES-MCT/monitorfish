import styled from 'styled-components'

import { ReactComponent as SortSVG } from '../../features/icons/ascendant-descendant.svg'

import type { HTMLAttributes } from 'react'

type CardTableColumnTitleProps = HTMLAttributes<HTMLDivElement> & {
  children: string
  dataCy?: string
  isAscending?: boolean
  isSortColumn?: boolean
  isSortable?: boolean
}
export function CardTableColumnTitle({
  children,
  dataCy = '',
  isAscending = false,
  isSortable = false,
  isSortColumn = false,
  onClick
}: CardTableColumnTitleProps) {
  return (
    <StyledCardTableColumnTitle data-cy={dataCy} isSortable={isSortable} onClick={onClick}>
      {children}
      {isSortable && isSortColumn && <Sort title={isAscending ? 'Croissant' : 'Décroissant'} />}
    </StyledCardTableColumnTitle>
  )
}

const StyledCardTableColumnTitle = styled.div<{
  isSortable?: boolean
}>`
  cursor: ${p => (p.isSortable ? 'pointer' : '')};
`

const Sort = styled(SortSVG)<{
  isAscending?: boolean
}>`
  width: 37px;
  height: 14px;
  padding: 0px;
  margin-left: auto;
  cursor: pointer;
  transform: ${p => (p.isAscending ? 'rotate(180deg)' : 'none')};
`
