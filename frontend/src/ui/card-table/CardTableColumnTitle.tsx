import styled from 'styled-components'

import { ReactComponent as SortSVG } from '../../features/icons/ascendant-descendant.svg'

import type { HTMLAttributes } from 'react'

type CardTableColumnTitleProps = HTMLAttributes<HTMLDivElement> & {
  children: string
  dataCy?: string | undefined
  isAscending?: boolean | undefined
  isSortable?: boolean | undefined
  isSortedColumn?: boolean | undefined
}
export function CardTableColumnTitle({
  children,
  dataCy = '',
  isAscending = false,
  isSortable = false,
  isSortedColumn = false,
  onClick
}: CardTableColumnTitleProps) {
  return (
    <StyledCardTableColumnTitle $isSortable={isSortable} data-cy={dataCy} onClick={onClick} title={String(children)}>
      <span>{children}</span>
      {isSortable && isSortedColumn && (
        <Sort $isAscending={isAscending} title={isAscending ? 'Croissant' : 'Décroissant'} />
      )}
    </StyledCardTableColumnTitle>
  )
}

const StyledCardTableColumnTitle = styled.div<{
  $isSortable?: boolean
}>`
  align-items: center;
  cursor: ${p => (p.$isSortable ? 'pointer' : '')};
  display: flex;
  flex-grow: 1;
  justify-content: space-between;

  > span {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const Sort = styled(SortSVG)<{
  $isAscending?: boolean
}>`
  width: 37px;
  height: 14px;
  padding: 0px;
  margin-left: auto;
  cursor: pointer;
  transform: ${p => (p.$isAscending ? 'rotate(180deg)' : 'none')};
`
