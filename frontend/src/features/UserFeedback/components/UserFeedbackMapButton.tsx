import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Button, FileUploader, Icon, MapMenuDialog, Textarea, UploadMode } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'
import { useSendUserFeedbackMutation } from '../apis'

import type { FileApi } from '@mtes-mct/monitor-ui'

export function UserFeedbackMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.USER_FEEDBACK)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [files, setFiles] = useState<FileApi[]>([])
  const [fileError, setFileError] = useState<string | undefined>(undefined)
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
      await sendUserFeedback({ files, message, pageUrl: window.location.href }).unwrap()
      setMessage(undefined)
      setFiles([])
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
                <Success>Merci, nous allons prendre connaissance de votre message et vous répondre.</Success>
              ) : (
                <>
                  <p>
                    Une remarque, une idée ou un problème ? Écrivez-nous, l&apos;équipe MonitorFish vous répondra par
                    e-mail. Vous pouvez joindre des captures d&apos;écran.
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
                  <FileUploader
                    files={files}
                    mode={UploadMode.IMAGES}
                    onDelete={setFiles}
                    onError={setFileError}
                    onUpload={nextFiles => {
                      setFileError(undefined)
                      setFiles(nextFiles)
                    }}
                  />
                  {fileError && <ErrorMessage>{fileError}</ErrorMessage>}
                  {isError && (
                    <ErrorMessage>Nous n&apos;avons pas pu envoyer votre message. Veuillez réessayer.</ErrorMessage>
                  )}
                </>
              )}
            </StyledBody>
            {!isSuccess && (
              <Footer>
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
              </Footer>
            )}
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

const Footer = styled(MapMenuDialog.Footer)`
  box-sizing: border-box;
`

const ErrorMessage = styled.p`
  color: ${p => p.theme.color.maximumRed};
`
