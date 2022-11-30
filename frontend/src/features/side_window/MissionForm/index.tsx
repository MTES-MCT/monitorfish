import { useMemo } from 'react'
import styled from 'styled-components'

import { HeaderTitle } from './HeaderTitle'
import { MainForm } from './MainForm.tsx'

import type { Mission } from '../../../domain/types/mission'

export type MissionFormProps = {
  mission?: Mission
}
export function MissionForm({ mission }: MissionFormProps) {
  const isNew = useMemo(() => Boolean(mission), [mission])
  console.log(isNew)

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>Ajout d’une nouvelle mission</HeaderTitle>
      </Header>
      <FormWrapper>
        <MainForm mission={mission} />
        <ActionsForm>actions form</ActionsForm>
      </FormWrapper>
    </Wrapper>
  )
}

// TODO Check why there is a `box-sizing: revert` in index.css.
const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* TODO Switch to flex sizing once SideWindow is full-flex. */
  /* flex-grow: 1; */
  height: calc(100% - 47px);
  /* max-height: calc(100% - 47px); */

  * {
    box-sizing: border-box;
  }
`

const Header = styled.div`
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.goldenPoppy};
  padding: 2rem;
`

const FormWrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  max-height: calc(100% - 67px);
`

const ActionsForm = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;
  flex-direction: column;
  flex-grow: 0.34;
`
