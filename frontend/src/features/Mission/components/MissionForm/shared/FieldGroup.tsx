import styled, { css } from 'styled-components'

export const FieldGroup = styled.div<{
  isInline?: boolean
}>`
  display: flex;
  flex-direction: ${p => (p.isInline ? 'row' : 'column')};

  ${p =>
    p.isInline &&
    css`
      align-items: flex-end;

      > div:not(:last-child) {
        margin-right: 16px;
      }

      > div:last-child {
        margin-bottom: 13px;
        white-space: nowrap;
      }
    `}

  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 8px;
  }
`
