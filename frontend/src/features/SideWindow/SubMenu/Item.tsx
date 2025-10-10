import { AdditionalSubMenu } from '@features/Alert/components/SideWindowAlerts/constants'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

type ItemProps<T extends string = string> = {
  badgeCounter?: ((subMenu: T) => number | undefined) | undefined
  counter: ((subMenu: T) => number) | undefined
  isSelected: boolean
  onClick: (nextSubMenuItem: T) => Promisable<void>
  option: Option<T>
  width: number
}
export function Item<T extends string = string>({
  badgeCounter,
  counter,
  isSelected,
  onClick,
  option,
  width
}: ItemProps<T>) {
  const count = counter ? counter(option.value) : 0
  const badgeNumber = badgeCounter ? badgeCounter(option.value) : undefined

  return (
    <MenuButton
      $isSelected={isSelected}
      $width={width}
      data-cy={`side-window-sub-menu-${option.value}`}
      onClick={() => onClick(option.value)}
    >
      <span>
        {option.value === AdditionalSubMenu.ALERT_MANAGEMENT && <StyledSettings />}
        {option.label}
      </span>
      {count > 0 && (
        <CircleWithKeyMetric $isSelected={isSelected} data-cy={`side-window-sub-menu-${option.value}-number`}>
          {count}
          {!!badgeNumber && <BadgeNumber>{badgeNumber}</BadgeNumber>}
        </CircleWithKeyMetric>
      )}
    </MenuButton>
  )
}

const StyledSettings = styled(Icon.Settings)`
  margin-right: 8px;
`

const BadgeNumber = styled.div`
  display: inline-block;
  position: absolute;
  height: 15px;
  padding: 0 4px;
  text-align: center;
  border-radius: 10px;
  top: -10px;
  line-height: 14px;
  right: -10px;
  background: ${p => p.theme.color.maximumRed};
  color: ${p => p.theme.color.white};
  font-size: 12px;
  letter-spacing: 0;
  font-weight: 700;
`

const MenuButton = styled.div<{
  $isSelected: boolean
  $width: number
}>`
  align-items: center;
  background: ${p => (p.$isSelected ? p.theme.color.lightGray : 'unset')};
  color: ${p => (p.$isSelected ? p.theme.color.gunMetal : p.theme.color.slateGray)};
  border-bottom: 0.5px solid ${p => p.theme.color.lightGray};
  cursor: pointer;
  display: flex;
  height: 47px;
  justify-content: space-between;
  opacity: 1;
  padding: 0 16px;
  transition: all 0.5s ease;
  width: ${p => p.$width - 32}px;

  span:first-child {
    font-size: 16px;
    vertical-align: bottom;
  }
`

const CircleWithKeyMetric = styled.span<{
  $isSelected: boolean
}>`
  position: relative;
  background: ${p => (p.$isSelected ? p.theme.color.charcoal : p.theme.color.lightGray)};
  border-radius: 2px;
  color: ${p => (p.$isSelected ? p.theme.color.white : p.theme.color.slateGray)};
  font-size: 13px;
  line-height: 1;
  padding: 1px 4px 4px;
  transition: opacity 0.5s ease;
`
