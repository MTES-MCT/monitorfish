import { ConfirmationModal } from '@components/ConfirmationModal'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import type { AlertSpecification } from '@features/Alert/types'

type ActionButtonsCellProps = Readonly<{
  alertSpecification: AlertSpecification
}>
export function ActionButtonsCell({ alertSpecification }: ActionButtonsCellProps) {
  const [isDeleteAlertConfirmationModalOpen, setIsDeleteAlertConfirmationModalOpen] = useState(false)

  const edit = () => {
    if (!alertSpecification.isUserDefined) {
      // TODO Implement
    }
  }

  const deleteAlert = () => {}

  return (
    <>
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
          disabled
          Icon={Icon.Delete}
          onClick={() => {
            setIsDeleteAlertConfirmationModalOpen(true)
          }}
          title="Supprimer l'alerte"
          withUnpropagatedClick
        />
      </Wrapper>
      {isDeleteAlertConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <>
              <p>
                <b>Êtes-vous sûr de vouloir supprimer cette alerte ?</b>
              </p>
              <p>
                Cela supprimera la définition et les critères de l&apos;alerte, ainsi que toutes ses occurrences en
                cours.
              </p>
            </>
          }
          onCancel={() => setIsDeleteAlertConfirmationModalOpen(false)}
          onConfirm={deleteAlert}
          title="Supprimer l'alerte"
        />
      )}
    </>
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
