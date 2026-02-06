// TODO This is not the cleanest way to achieve that.

import styled from 'styled-components'

type FieldsetGroupSeparatorType = Readonly<{
  className?: string | undefined
  marginBottom?: number | undefined
}>
export function FieldsetGroupSeparator({ className, marginBottom }: FieldsetGroupSeparatorType) {
  return (
    <Wrapper className={className} marginBottom={marginBottom}>
      <HorizontalRule />
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  marginBottom?: number | undefined
}>`
  height: 4px;
  margin-top: 16px;
  margin-bottom: ${p => p.marginBottom ?? 0}px;
  position: relative;
`

const HorizontalRule = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  height: 4px;
  left: -16px;
  position: relative;
  width: calc(100% + 32px);
`
