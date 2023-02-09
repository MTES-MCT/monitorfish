import styled from 'styled-components'

export const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 32px 32px;

  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }

  hr {
    background: ${p => p.theme.color.slateGray};
    height: 2px;
    margin: 24px 0 0;
  }

  /* p {
    color: ${p => p.theme.color.slateGray};
    font-size: 13px;
    line-height: 1.4;
    margin: 0;

    &:not(:first-child) {
      margin-top: 8px;
    }
  } */
`
