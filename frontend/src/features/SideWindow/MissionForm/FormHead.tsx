import styled from 'styled-components'

export const FormHead = styled.div`
  align-items: center;
  display: flex;
  padding: 2rem;

  > div {
    margin-left: 1.5rem;
  }

  > h2 {
    color: ${p => p.theme.color.charcoal};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    margin: 0;

    > div {
      margin-right: 0.25rem;
    }
  }
`
