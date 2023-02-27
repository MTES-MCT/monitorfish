// TODO This is not the cleanest way to achieve that.

import styled from 'styled-components'

export function FieldsetGroupSeparator() {
  return (
    <Wrapper>
      <HorizontalRule />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  height: 4px;
  position: relative;
`

const HorizontalRule = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  height: 4px;
  left: -16px;
  position: relative;
  width: calc(100% + 32px);
`
