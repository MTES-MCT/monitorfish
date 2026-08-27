import { startupNotificationActions } from '@features/StartupNotification/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, Dialog } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

const SURVEY_URL = 'https://grist.numerique.gouv.fr/o/docs/forms/bdEF1UoEz9SPSKPUL6gw5f/4'

export function SurveyModal() {
  const dispatch = useMainAppDispatch()

  const onCancel = () => {
    dispatch(startupNotificationActions.setIsSurveyModalDisplayed(true))
  }

  const onConfirm = () => {
    window.open(SURVEY_URL, '_blank', 'noopener,noreferrer')

    dispatch(startupNotificationActions.setIsSurveyModalDisplayed(true))
  }

  return (
    <StyledDialog>
      <Dialog.Title onClose={onCancel}>Enquête MonitorFish</Dialog.Title>
      <StyledBody>
        <p>
          Un questionnaire vous a été envoyé fin juillet afin de mieux comprendre la manière dont vous vous servez de
          MonitorFish et d'identifier des points d'amélioration qui vous seraient utiles.
        </p>

        <p>
          Si vous ne l'avez pas déjà fait, n'hésitez pas, c'est le moment d'y répondre ! (temps de réponse estimé 5 à 10
          min).
        </p>
      </StyledBody>
      <Dialog.Action>
        <Button accent={Accent.SECONDARY} onClick={onCancel}>
          Non, merci
        </Button>
        <Button accent={Accent.PRIMARY} onClick={onConfirm}>
          Répondre à l'enquête
        </Button>
      </Dialog.Action>
    </StyledDialog>
  )
}

const StyledDialog = styled(Dialog)`
  > div:nth-child(2) {
    width: 800px;
  }
`

const StyledBody = styled(Dialog.Body)`
  > p,
  span {
    color: ${p => p.theme.color.charcoal};
    font-size: 16px !important;
  }
`
