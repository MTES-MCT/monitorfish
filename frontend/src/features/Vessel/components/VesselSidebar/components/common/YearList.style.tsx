import { TransparentButton } from '@components/style'
import { ChevronIconButton } from '@features/commonStyles/icons/ChevronIconButton'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { HTMLProps } from 'react'

export const YearListTitle = styled(TransparentButton)`
  display: flex;
  flex: 1;
  min-width: 0;
  padding: 7px 5px 5px 16px;
`

export const YearListTitleText = styled.div`
  display: flex;
  align-items: center;
  color: ${THEME.color.slateGray};
  font-size: 13px;
  font-weight: 500;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const YearListContent = styled.div<HTMLProps<HTMLDivElement>>`
  background: ${p => p.theme.color.white};
  border-top: 1px solid ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.gunMetal};
  overflow: hidden;
  width: 100%;
`

// The box stays symmetric around the icon so that `rotate` pivots on its center.
// 16px gap to the right = 8px (20px icon centered in 36px) + 2px (chevron path inset in its viewBox) + 6px margin
export const YearListChevronIcon = styled(ChevronIconButton)`
  box-sizing: border-box;
  flex-shrink: 0;
  height: 36px;
  margin-right: 6px;
  padding: 0;
  width: 36px;

  svg {
    color: ${p => p.theme.color.charcoal};
  }
`

export const YearListRow = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  height: 36px;
`
