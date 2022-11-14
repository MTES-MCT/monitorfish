import styled from 'styled-components'

import { Icon } from './icons'

import type { IconName } from './icons/constants'
import type { ButtonHTMLAttributes } from 'react'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconName: IconName
}
export function IconButton({ iconName, type = 'button', ...nativeProps }: IconButtonProps) {
  // TODO Move the standardized icons inside `ui/` directory
  const IconAsSvg = Icon[iconName]

  return (
    // eslint-disable-next-line react/button-has-type
    <Button type={type} {...nativeProps}>
      <IconAsSvg />
    </Button>
  )
}

const Button = styled.button`
  border: 1px solid ${p => p.theme.color.lightGray};
  padding: 4px 4px 0;
  vertical-align: bottom;

  :disabled {
    cursor: not-allowed;
  }
`
