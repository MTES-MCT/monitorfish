import { Icon as IconUI, type IconProps, LinkButton, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { FunctionComponent } from 'react'

interface ResetButtonProps {
  'data-cy'?: string
  Icon?: FunctionComponent<IconProps> | undefined
  iconColor?: string
  label?: string
  onClick: () => void
}

export function ResetButton({
  'data-cy': dataCy,
  Icon = IconUI.Load,
  iconColor = THEME.color.charcoal,
  label = 'Réinitialiser les filtres',
  onClick
}: ResetButtonProps) {
  return (
    <StyledLinkButton $iconColor={iconColor} data-cy={dataCy} Icon={Icon} onClick={onClick}>
      <span>{label}</span>
    </StyledLinkButton>
  )
}

const StyledLinkButton = styled(LinkButton)<{
  $iconColor: string
}>`
  color: ${p => p.theme.color.charcoal} !important;
  white-space: nowrap;

  svg,
  span {
    color: ${p => p.$iconColor};
  }
  &:hover svg,
  &:active svg,
  &:focus svg {
    color: ${p => p.$iconColor};
  }
`
