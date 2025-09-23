import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { AlertSpecification } from '@features/Alert/types'

type ActionButtonsCellProps = Readonly<{
  alertSpecification: AlertSpecification
  onDeleteConfirmation?: ((alertSpecification: AlertSpecification) => void) | undefined
}>
export function ActionButtonsCell({ alertSpecification, onDeleteConfirmation }: ActionButtonsCellProps) {
  const edit = () => {
    if (!alertSpecification.isUserDefined) {
      // TODO Implement
    }
  }

  return (
    <Wrapper>
      <IconButton
        accent={Accent.TERTIARY}
        disabled
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
