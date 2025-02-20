import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, IconButton, Size } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { IconButtonProps } from '@mtes-mct/monitor-ui/elements/IconButton'

type MapToolButtonProps = {
  className?: string | undefined
  isActive: boolean
  isLeftButton?: boolean
  title: string
} & IconButtonProps
export function MapToolButton({ className, isActive, isLeftButton = false, title, ...props }: MapToolButtonProps) {
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const isRightMenuShrinked = !rightMenuIsOpen && !isLeftButton

  return (
    <StyledButton
      $hasBadgeNumber={!!props.badgeNumber}
      $hasHealthcheckTextWarning={!!healthcheckTextWarning.length}
      $isActive={isActive}
      $isHidden={!!previewFilteredVesselsMode}
      $isLeftButton={isLeftButton}
      $isRightMenuShrinked={isRightMenuShrinked}
      accent={Accent.PRIMARY}
      aria-label={title}
      className={className}
      size={Size.LARGE}
      title={title}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  )
}

const StyledButton = styled(IconButton)<{
  $hasBadgeNumber: boolean
  $hasHealthcheckTextWarning: boolean | undefined
  $isActive: boolean
  $isHidden: boolean | undefined
  $isLeftButton: boolean
  $isRightMenuShrinked: boolean
}>`
  height: 40px;
  margin-top: ${p => (p.$hasHealthcheckTextWarning ? 50 : 0)}px;
  visibility: ${p => (p.$isHidden ? 'hidden' : 'visible')};
  position: absolute;
  display: inline-block;
  z-index: 99;
  width: ${p => (p.$isRightMenuShrinked ? '5px' : '40px')};
  border-radius: ${p => (p.$isRightMenuShrinked ? '1px' : '2px')};
  background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  transition: all 0.3s;
  span {
    opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  }

  ${p => {
    const padding = p.$isRightMenuShrinked ? `padding: 6px 0px 6px 0px;` : `padding: 6px 6px 6px 6px;`
    const activeProperties = p.$isActive
      ? `
      background: ${p.theme.color.blueGray};
      border-color: ${p.theme.color.blueGray};
    `
      : ''

    if (p.$hasBadgeNumber) {
      return `button {
        ${padding}
        ${activeProperties}
      }`
    }

    return `
      ${padding}
      ${activeProperties}
    `
  }}

  ${p => {
    if (p.$isLeftButton) {
      return `
        margin-right: 5px;
        left: ${p.$isRightMenuShrinked ? 0 : 10}px;
      `
    }

    return `
      margin-left: 5px;
      right: ${p.$isRightMenuShrinked ? 0 : 10}px;
    `
  }}
`
