import styled from 'styled-components'

export const FormHead = styled.div<{
  isAction?: boolean
}>`
  align-items: end;
  display: flex;
  margin: ${p => (p.isAction ? '0px' : '32px 40px 32px 40px')};
  padding-bottom: 8px;
  height: 32px;
  border-bottom: 1px solid ${'#ff3392'};
  flex-shrink: 0;

  > div {
    margin-left: auto;
  }

  > h2 {
    color: ${p => p.theme.color.charcoal};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    margin: 0;

    > span {
      margin-right: 8px;
      vertical-align: -2px;
    }
  }
`
