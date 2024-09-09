import { COLORS } from '@constants/constants'
import styled from 'styled-components'

import ChevronIconSVG from '../../../../icons/Chevron_simple_gris.svg?react'

import type { HTMLProps } from 'react'

export const YearListTitle = styled.div<{
  isEmpty: boolean
  isOpen: boolean
}>`
  padding: 7px 5px 5px 16px;
  width: 100%;
  display: flex;
  user-select: none;
  ${p => (p.isEmpty ? null : 'cursor: pointer;')}
  ${p => (!p.isOpen ? null : `border-bottom: 1px solid ${p.theme.color.lightGray};`)}
`

export const YearListTitleText = styled.div<
  {
    isEmpty: boolean
  } & HTMLProps<HTMLDivElement>
>`
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: 500;
  width: 95%;
  ${p => (p.isEmpty ? null : 'cursor: pointer;')}
`

export const YearListContent = styled.div<HTMLProps<HTMLDivElement>>`
  overflow: hidden;
`

export const YearListChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  transform: ${p => (p.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
  width: 16px;
  margin-right: 10px;
  margin-top: 9px;
  float: right;
  transition: all 0.3s;
`
