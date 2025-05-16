import { Icon, Tag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { TagProps } from '@mtes-mct/monitor-ui/elements/Tag'

export function TagInfo({ children, ...props }: TagProps) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StyledTag {...props} Icon={Icon.Attention} withCircleIcon>
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
    transform: rotate(180deg);
  }

  .Element-IconBox {
    margin-left: 4px;
    margin-right: 0;
  }
`
