import styled from 'styled-components'

export const Double = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;

  > div {
    max-width: 50%;
    width: 50%;
  }
`
export const ExtendedSpecyCode = styled.span`
  color: ${p => p.theme.color.slateGray};
`

export const InputRow = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.gainsboro};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  padding-right: 8px;

  > .Field-NumberInput {
    flex-grow: 1;
    margin-right: 8px;

    > input {
      border: none !important;
      padding: 6px 8px 4px;
    }
  }
`
