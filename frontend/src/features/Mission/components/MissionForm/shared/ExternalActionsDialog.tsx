import { Bold } from '@components/style'
import { Mission } from '@features/Mission/mission.types'
import { Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type ExternalActionsModalProps = {
  onClose: () => void
  sources: Mission.MissionSource[]
}

export function ExternalActionsDialog({ onClose, sources }: ExternalActionsModalProps) {
  const isCACEM = sources.includes(Mission.MissionSource.MONITORENV)
  const isRapportNav = sources.includes(Mission.MissionSource.RAPPORT_NAV)

  const getPersonToContact = () => {
    if (isCACEM && !isRapportNav) {
      return 'le CACEM'
    }

    if (!isCACEM && isRapportNav) {
      return "l'unité"
    }

    return "le CACEM et l'unité"
  }

  return (
    <Dialog data-cy="external-actions-modal" isAbsolute>
      <Dialog.Title onClose={onClose}>Suppression impossible</Dialog.Title>
      <Dialog.Body>
        <p>
          {`La mission ne peut pas être supprimée, car elle comporte des `}
          <br />
          {`événements ajoutés par `}
          <Bold>{getPersonToContact()} </Bold>.
        </p>

        <p>
          <RedText>
            {`Si vous souhaitez tout de même la supprimer, veuillez contacter `}
            <br />
            {getPersonToContact()} {`pour qu'il supprime d'abord ses événements.`}
          </RedText>
        </p>
      </Dialog.Body>

      <Dialog.Action>
        <Button onClick={onClose}>Fermer</Button>
      </Dialog.Action>
    </Dialog>
  )
}

const RedText = styled(Bold)`
  color: ${props => props.theme.color.maximumRed} !important;
`
