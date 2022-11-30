import { useMemo } from 'react'
import styled from 'styled-components'

import type { ButtonHTMLAttributes } from 'react'

export enum ButtonAccent {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  TERTIARY = 'TERTIARY'
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  accent?: ButtonAccent
  isFullWidth?: boolean
}
export function Button({
  accent = ButtonAccent.PRIMARY,
  isFullWidth = false,
  type = 'button',
  ...nativeProps
}: ButtonProps) {
  const commonProps = useMemo(
    () => ({
      isFullWidth,
      type,
      ...nativeProps
    }),
    [isFullWidth, nativeProps, type]
  )

  switch (accent) {
    case ButtonAccent.SECONDARY:
      return <SecondaryButton {...commonProps} />

    case ButtonAccent.TERTIARY:
      return <TertiaryButton {...commonProps} />

    default:
      return <PrimaryButton {...commonProps} />
  }
}

const StyledButton = styled.button<{
  isFullWidth: boolean
}>`
  font-size: 13px;
  padding: 5px 12px;
  height: 30px;
  width: ${p => (p.isFullWidth ? '100%' : 'auto')};
`

const PrimaryButton = styled(StyledButton)<{
  isFullWidth: boolean
}>`
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};

  :hover,
  :focus {
    background: ${p => p.theme.color.charcoal};
  }

  :disabled {
    border: 1px solid ${p => p.theme.color.lightGray};
    background: ${p => p.theme.color.lightGray};
    color: ${p => p.theme.color.white};
  }
`

const SecondaryButton = styled(StyledButton)<{
  isFullWidth: boolean
}>`
  border: 1px solid ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gunMetal};

  :disabled {
    border: 1px solid ${p => p.theme.color.lightGray};
    color: ${p => p.theme.color.slateGray};
  }
`

const TertiaryButton = styled(StyledButton)<{
  isFullWidth: boolean
}>`
  color: ${p => p.theme.color.gunMetal};

  :disabled {
    border: 1px solid ${p => p.theme.color.lightGray};
    color: ${p => p.theme.color.slateGray};
  }
`
