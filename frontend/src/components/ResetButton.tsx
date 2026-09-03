import { Icon as IconUI, type IconProps, LinkButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { FunctionComponent } from 'react'

interface ResetButtonProps {
  'data-cy'?: string
  Icon?: FunctionComponent<IconProps> | undefined
  label?: string
  onClick: () => void
}

export function ResetButton({
  'data-cy': dataCy,
  Icon = IconUI.Load,
  label = 'Réinitialiser les filtres',
  onClick
}: ResetButtonProps) {
  return (
    <StyledLinkButton data-cy={dataCy} Icon={Icon} onClick={onClick}>
      <span>{label}</span>
    </StyledLinkButton>
  )
}

const StyledLinkButton = styled(LinkButton)`
  color: ${p => p.theme.color.charcoal} !important;
  white-space: nowrap;

  svg,
  span {
    color: ${p => p.theme.color.charcoal};
  }
  &:hover svg,
  &:active svg,
  &:focus svg {
    color: ${p => p.theme.color.charcoal};
  }
`
