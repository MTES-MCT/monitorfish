import { MissingFieldsText } from '@features/Mission/components/MissionForm/ActionForm/shared/MissingFieldsText'
import { FormHead } from '@features/Mission/components/MissionForm/shared/FormHead'
import styled from 'styled-components'

export function ActionFormHeader({ children }) {
  return (
    <Wrapper>
      <FormHead isAction>
        <h2>{children}</h2>
      </FormHead>
      <MissingFieldsText />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin: 32px 40px 26px 40px;
`
