import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { ReactNode } from 'react'

export namespace Criteria {
  export const Wrapper = styled.div`
    margin-top: 24px;
  `

  export const Head = styled.button`
    padding: 7px 16px;
    background-color: ${p => p.theme.color.white};
    display: flex;
    flex-direction: row;
    width: 100%;
    text-align: left;
  `

  export const Title = styled.h3`
    color: ${p => p.theme.color.gunMetal};
    font-weight: 500;
    font-size: 13px;
    line-height: unset;
    flex-grow: 1;
  `

  export const Body = styled.div<{
    $isOpen: boolean
  }>`
    margin-top: 1px;
    padding: ${p => (p.$isOpen ? '16px' : '0 0 0 16px')};
    background-color: ${p => p.theme.color.white};
    height: ${p => (p.$isOpen ? 'inherit' : '0')};
    overflow: ${p => (p.$isOpen ? 'visible' : 'hidden')};
    transition: all 0.2s;
  `

  export const ChevronIcon = styled(Icon.Chevron)<{
    $isOpen: boolean
  }>`
    transform: rotate(${p => (p.$isOpen ? 180 : 0)}deg);
    transition: all 0.2s ease;
  `

  export function Info({ children }: { children: ReactNode }) {
    return (
      <CriteriaInfo>
        <Icon.Info />
        <span>{children}</span>
      </CriteriaInfo>
    )
  }
}

const CriteriaInfo = styled.div`
  display: flex;
  font-style: italic;
  color: ${p => p.theme.color.slateGray};

  span:last-child {
    margin-left: 4px;
  }
`
