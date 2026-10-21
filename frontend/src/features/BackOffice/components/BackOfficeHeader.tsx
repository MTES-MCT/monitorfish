import styled from 'styled-components'

import type { Option } from '@mtes-mct/monitor-ui'
import type { ReactNode } from 'react'

type BackOfficeHeaderTabs<T extends string> = {
  onChange: (nextTab: T) => void
  options: Option<T>[]
  value: T
}

type BackOfficeHeaderProps<T extends string> = Readonly<{
  /** Displayed on the right of the header. */
  actions?: ReactNode
  /** Displayed next to the title (e.g. a year selector). */
  children?: ReactNode
  tabs?: BackOfficeHeaderTabs<T>
  title?: string
}>
export function BackOfficeHeader<T extends string = string>({
  actions,
  children,
  tabs,
  title
}: BackOfficeHeaderProps<T>) {
  return (
    <Wrapper>
      <Main>
        {!!title && <Title>{title}</Title>}
        {!!tabs && (
          <TabList role="tablist">
            {tabs.options.map(option => (
              <Tab
                key={option.value}
                $isSelected={option.value === tabs.value}
                aria-selected={option.value === tabs.value}
                onClick={() => tabs.onChange(option.value)}
                role="tab"
                type="button"
              >
                {option.label}
              </Tab>
            ))}
          </TabList>
        )}
        {children}
      </Main>
      {!!actions && <Actions>{actions}</Actions>}
    </Wrapper>
  )
}

const Wrapper = styled.header`
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 32px;
`

const Main = styled.div`
  align-items: center;
  display: flex;
  gap: 24px;
`

// Same look as the side window titles (see `Header.Title`)
const Title = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
`

const TabList = styled.div`
  display: flex;
  gap: 50px;
`

const Tab = styled.button<{
  $isSelected: boolean
}>`
  background: none;
  border: none;
  border-bottom: 5px solid ${p => (p.$isSelected ? p.theme.color.charcoal : 'transparent')};
  color: ${p => p.theme.color.charcoal};
  cursor: pointer;
  font-size: 22px;
  font-weight: 700;
  height: 38px;
  line-height: 1.4;
  padding: 0;
`

const Actions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 8px;
`
