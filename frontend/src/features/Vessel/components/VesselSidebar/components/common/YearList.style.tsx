import { TransparentButton } from '@components/style'
import { ChevronIconButton } from '@features/commonStyles/icons/ChevronIconButton'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { HTMLProps } from 'react'

export const YearListTitle = styled(TransparentButton)`
  padding: 7px 5px 5px 16px;
  width: 100%;
  display: flex;
`

export const YearListTitleText = styled.div`
  display: flex;
  align-items: center;
  color: ${THEME.color.slateGray};
  font-size: 13px;
  font-weight: 500;
  width: 95%;
`

export const YearListContent = styled.div<HTMLProps<HTMLDivElement>>`
  overflow: hidden;
  border-top: 1px solid ${p => p.theme.color.lightGray};
`

export const YearListChevronIcon = styled(ChevronIconButton)`
  svg {
    color: ${p => p.theme.color.charcoal};
  }
`
