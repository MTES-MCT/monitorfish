import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Level, Message } from '@mtes-mct/monitor-ui'
import { Mission } from 'domain/entities/mission/types'
import { cancelCreateAndRedirectToFilteredList } from 'domain/use_cases/mission/cancelCreateAndRedirectToFilteredList'
import { useField } from 'formik'
import { useMemo } from 'react'
import styled from 'styled-components'

import { missionFormActions } from '../../slice'

export function ControlUnitWarningMessage({ controlUnitIndex }: { controlUnitIndex: number }) {
  const dispatch = useMainAppDispatch()

  const [unitField] = useField<number | undefined>(`controlUnits.${controlUnitIndex}.id`)

  const engagedControlUnit = useMainAppSelector(state => state.missionForm.engagedControlUnit)

  const message = useMemo(() => {
    if (!engagedControlUnit) {
      return ''
    }

    if (engagedControlUnit.missionSources.length === 1) {
      const source = engagedControlUnit.missionSources[0]
      if (!source) {
        return ''
      }

      return `Une autre mission, ouverte par le ${Mission.MissionSourceLabel[source]}, est en cours avec cette unité.`
    }

    if (engagedControlUnit.missionSources.length > 1) {
      return `D'autres missions en cours, ouvertes par le ${engagedControlUnit.missionSources
        .map(source => Mission.MissionSourceLabel[source])
        .join(' et le ')}, sont en cours avec cette unité.`
    }

    return ''
  }, [engagedControlUnit])

  const validate = async () => {
    dispatch(missionFormActions.setEngagedControlUnit(undefined))
  }

  const cancel = async () => {
    const controlUnitName = engagedControlUnit?.controlUnit?.name
    if (controlUnitName) {
      dispatch(cancelCreateAndRedirectToFilteredList({ controlUnitName }))
    }
  }

  if (!engagedControlUnit || engagedControlUnit?.controlUnit.id !== unitField.value) {
    return null
  }

  return (
    <StyledMessage level={Level.WARNING}>
      <Warning>Attention</Warning>
      <div>
        <span>{message}</span>
        <br />
        <span>Voulez-vous quand même conserver cette mission ?</span>
      </div>

      <ButtonsContainer>
        <Button accent={Accent.WARNING} onClick={validate}>
          Oui, la conserver
        </Button>
        <Button accent={Accent.WARNING} onClick={cancel}>
          Non, l&apos;abandonner
        </Button>
      </ButtonsContainer>
    </StyledMessage>
  )
}

const StyledMessage = styled(Message)`
  margin-top: 8px;
`
const Warning = styled.p`
  color: ${({ theme }) => theme.color.goldenPoppy};
  font-weight: bold;
`
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`
