import { alertActions } from '@features/Alert/components/SideWindowAlerts/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { AlertSpecification } from '@features/Alert/types'

type ActionButtonsCellProps = Readonly<{
  alertSpecification: AlertSpecification
  onDeleteConfirmation?: ((alertSpecification: AlertSpecification) => void) | undefined
}>
export function ActionButtonsCell({ alertSpecification, onDeleteConfirmation }: ActionButtonsCellProps) {
  const dispatch = useMainAppDispatch()

  const edit = () => {
    if (!alertSpecification.isUserDefined) {
      return
    }

    dispatch(alertActions.setEditedAlertSpecification(alertSpecification))
  }

  return (
    <Wrapper>
      <IconButton
        accent={Accent.TERTIARY}
        disabled={!alertSpecification.isUserDefined}
        Icon={Icon.Edit}
        onClick={edit}
        title="Éditer l'alerte"
        withUnpropagatedClick
      />
      <IconButton
        accent={Accent.TERTIARY}
        disabled={!alertSpecification.isUserDefined}
        Icon={Icon.Delete}
        onClick={() => {
          if (onDeleteConfirmation) {
            onDeleteConfirmation(alertSpecification)
          }
        }}
        title={`Supprimer l'alerte "${alertSpecification.name}"`}
        withUnpropagatedClick
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  height: 20px;
  margin-bottom: 1px;

  > button {
    padding: 0;
  }
`
