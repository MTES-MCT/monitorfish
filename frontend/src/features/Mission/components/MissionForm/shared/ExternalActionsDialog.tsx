import { Mission } from '@features/Mission/mission.types'
import { Button, Dialog, Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type ExternalActionsModalProps = {
  onClose: () => void
  sources: Mission.MissionSource[]
}

export function ExternalActionsDialog({ onClose, sources }: ExternalActionsModalProps) {
  const isCACEM = sources.includes(Mission.MissionSource.MONITORENV)

  return (
    <Dialog data-cy="external-actions-modal" isAbsolute>
      <Dialog.Title>Suppression impossible</Dialog.Title>
      <Dialog.Body>
        <Alert>
          <Icon.Attention color={THEME.color.maximumRed} size={30} />
        </Alert>
        <Text>{`La mission ne peut pas être supprimée, car elle comporte des événements ajoutés par ${
          isCACEM ? 'le CACEM' : ''
        }.`}</Text>
        <Bold>
          {`Si vous souhaitez tout de même la supprimer, veuillez contacter  ${
            isCACEM ? 'le CACEM' : ''
          } pour qu'il supprime d'abord
            ses événements.`}
        </Bold>
      </Dialog.Body>

      <Dialog.Action>
        <Button data-cy="external-actions-modal-close" onClick={onClose}>
          Fermer
        </Button>
      </Dialog.Action>
    </Dialog>
  )
}

const Alert = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`
const Text = styled.p`
  color: ${props => props.theme.color.maximumRed} !important;
  padding: 2px 40px;
`
const Bold = styled.p`
  color: ${props => props.theme.color.maximumRed} !important;
  font-weight: bold;
  padding: 2px 40px;
`
