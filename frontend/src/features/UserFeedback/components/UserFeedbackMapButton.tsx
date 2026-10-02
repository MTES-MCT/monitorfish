import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Button, Icon, MapMenuDialog, Textarea } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'
import { useSendUserFeedbackMutation } from '../apis'

export function UserFeedbackMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.USER_FEEDBACK)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [sendUserFeedback, { isError, isLoading, isSuccess, reset }] = useSendUserFeedbackMutation()

  const isSendable = !!message?.trim() && !isLoading

  const openOrClose = () => {
    dispatch(setRightMapBoxDisplayed(rightMapBoxOpened === MapBox.USER_FEEDBACK ? undefined : MapBox.USER_FEEDBACK))

    if (isSuccess) {
      reset()
    }
  }

  const send = async () => {
    if (!message) {
      return
    }

    try {
      await sendUserFeedback({ message, pageUrl: window.location.href }).unwrap()
      setMessage(undefined)
    } catch {
      // The error is displayed from the mutation state
    }
  }

  return (
    <>
      <MapToolButton Icon={Icon.Comment} isActive={isOpened} onClick={openOrClose} title="Nous contacter" />
      {isRendered && (
        <StyledMapToolBox data-cy="map-user-feedback-box" hideBoxShadow isOpen={isOpened}>
          <StyledContainer>
            <MapMenuDialog.Header>
              <MapMenuDialog.Title>Nous contacter</MapMenuDialog.Title>
              <CloseButton Icon={Icon.Close} onClick={openOrClose} title="Fermer" />
            </MapMenuDialog.Header>
            <StyledBody>
              {isSuccess ? (
                <Success>Merci, nous prendrons connaissance de votre message.</Success>
              ) : (
                <>
                  <p>
                    Une remarque, une idée ou un problème ? Écrivez-nous, l&apos;équipe MonitorFish vous répondra par
                    e-mail.
                  </p>
                  <StyledTextarea
                    isLabelHidden
                    label="Votre message"
                    maxLength={2000}
                    name="user-feedback-message"
                    onChange={setMessage}
                    placeholder="Votre message..."
                    rows={5}
                    value={message}
                  />
                  {isError && (
                    <ErrorMessage>Nous n&apos;avons pas pu envoyer votre message. Veuillez réessayer.</ErrorMessage>
                  )}
                  <Button
                    disabled={!isSendable}
                    Icon={Icon.Send}
                    isFullWidth
                    onClick={() => {
                      void send()
                    }}
                  >
                    Envoyer
                  </Button>
                </>
              )}
            </StyledBody>
          </StyledContainer>
        </StyledMapToolBox>
      )}
    </>
  )
}

const StyledMapToolBox = styled(MapToolBox)`
  bottom: 0;
`

const CloseButton = styled(MapMenuDialog.CloseButton)`
  margin-top: 4px;
`

const Success = styled.p`
  margin: 12px;
`

const StyledTextarea = styled(Textarea)`
  width: calc(100% - 20px);
`

const StyledContainer = styled(MapMenuDialog.Container)`
  margin-right: unset;

  > div:first-child {
    height: 22px;
  }
`

const StyledBody = styled(MapMenuDialog.Body)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ErrorMessage = styled.p`
  color: ${p => p.theme.color.maximumRed};
`
