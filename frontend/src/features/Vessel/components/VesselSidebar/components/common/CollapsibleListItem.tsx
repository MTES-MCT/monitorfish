import { useState } from 'react'

import { ListItem } from './common.style'
import { YearListChevronIcon, YearListContent, YearListRow, YearListTitle, YearListTitleText } from './YearList.style'

import type { ReactNode } from 'react'

type CollapsibleListItemProps = Readonly<{
  children?: ReactNode
  className?: string
  'data-cy'?: string
  isEmpty?: boolean
  onOpen?: () => void
  title: ReactNode
  titleAttribute?: string
  titleDataCy?: string
}>

export function CollapsibleListItem({
  children,
  className,
  'data-cy': dataCy,
  isEmpty = false,
  onOpen,
  title,
  titleAttribute,
  titleDataCy
}: CollapsibleListItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    if (isEmpty) {
      return
    }

    if (!isOpen) {
      onOpen?.()
    }
    setIsOpen(!isOpen)
  }

  return (
    <ListItem className={className} data-cy={dataCy} title={titleAttribute}>
      <YearListRow>
        <YearListTitle as={isEmpty ? 'div' : 'button'} data-cy={titleDataCy} onClick={toggle}>
          <YearListTitleText>{title}</YearListTitleText>
        </YearListTitle>
        {!isEmpty && <YearListChevronIcon isOpen={isOpen} onClick={toggle} />}
      </YearListRow>
      {isOpen && <YearListContent>{children}</YearListContent>}
    </ListItem>
  )
}
