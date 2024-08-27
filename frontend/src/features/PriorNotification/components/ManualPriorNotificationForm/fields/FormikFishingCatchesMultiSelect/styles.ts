import styled from 'styled-components'

export const SubRow = styled.div`
  align-items: flex-start;
  column-gap: 8px;
  display: flex;
  justify-content: space-between;

  > .Field-Select {
    flex-grow: 1;
  }
`

export const InputWithUnit = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.gainsboro};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  max-width: 96px;
  min-width: 96px;
  padding-right: 8px;

  > .Field-NumberInput {
    flex-grow: 1;

    > input {
      border: none !important;
      padding: 6px 8px 5px;
    }
  }
`
