import { Icon, Tag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { TagProps } from '@mtes-mct/monitor-ui/elements/Tag'

export function TagInfo({ children, ...props }: TagProps) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledTag {...props} Icon={Icon.Info} withCircleIcon>
      {children}
    </StyledTag>
  )
}

const StyledTag = styled(Tag)`
  flex-direction: row-reverse;
  padding-left: 8px;
  padding-right: 1px;
  margin-bottom: 16px;

  svg {
    width: 16px;
    height: 16px;
  }

  .Element-IconBox {
    margin-top: 2px;
    margin-left: 6px;
    margin-right: 2px;
  }
`
