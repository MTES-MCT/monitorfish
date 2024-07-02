import { ErrorWall } from '@components/ErrorWall'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { LogbookMessage } from '@features/Logbook/components/VesselLogbook/LogbookMessages/messages/LogbookMessage'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { updatePriorNotificationNote } from '@features/PriorNotification/useCases/updatePriorNotificationNote'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import {
  getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches,
  getPriorNotificationTypesFromLogbookMessagePnoTypes,
  isZeroNotice
} from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button, FormikEffect, FormikTextarea, Icon } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik } from 'formik'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'
import { useDebouncedCallback } from 'use-debounce'

import { Header } from './Header'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { priorNotificationActions } from '../../slice'
import { DownloadButton } from '../shared/DownloadButton'
import { TagBar } from '../shared/TagBar'

const DEBOUNCE_DELAY = 500

export function PriorNotificationCard() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const priorNotificationDetail = useMainAppSelector(state => state.priorNotification.priorNotificationCardDetail)
  const sideWindowPriorNotificationCardError = useMainAppSelector(
    state => state.displayedError.sideWindowPriorNotificationCardError
  )
  const [isLoading, setIsLoading] = useState(false)
  const isPendingSend = priorNotificationDetail?.state === PriorNotification.State.PENDING_SEND
  const isSent = [PriorNotification.State.SENT, PriorNotification.State.VERIFIED_AND_SENT].includes(
    priorNotificationDetail?.state as any
  )

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCard())
  }

  const verifyAndSend = async () => {
    setIsLoading(true)

    assertNotNullish(priorNotificationDetail?.id)

    await dispatch(verifyAndSendPriorNotification(priorNotificationDetail.id, false))

    setIsLoading(false)
  }

  const updateNoteCallback = useCallback(
    async (note: string | undefined) => {
      assertNotNullish(priorNotificationDetail?.id)

      await dispatch(updatePriorNotificationNote(priorNotificationDetail.id, note))
    },
    [dispatch, priorNotificationDetail?.id]
  )

  const updateNote = useDebouncedCallback((note: string | undefined) => updateNoteCallback(note), DEBOUNCE_DELAY)

  if (sideWindowPriorNotificationCardError) {
    return (
      <Wrapper>
        <Background onClick={close} />

        <Card>
          <ErrorWall displayedErrorKey={DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_CARD_ERROR} />
        </Card>
      </Wrapper>
    )
  }

  if (!priorNotificationDetail) {
    return (
      <Wrapper>
        <Background onClick={close} />

        <Card>
          <LoadingSpinnerWall />
        </Card>
      </Wrapper>
    )
  }

  if (isLoading) {
    return (
      <Wrapper className="Form">
        <Background onClick={close} />

        <Card>
          <LoadingSpinnerWall />
        </Card>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Background onClick={close} />

      <Card>
        <FrontendErrorBoundary>
          <Header onClose={close} priorNotificationDetail={priorNotificationDetail} />

          <Body>
            <TagBar
              isVesselUnderCharter={priorNotificationDetail.isVesselUnderCharter}
              isZeroNotice={isZeroNotice(
                getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches(
                  priorNotificationDetail.logbookMessage.message.catchOnboard
                )
              )}
              riskFactor={priorNotificationDetail.riskFactor}
              state={priorNotificationDetail.state}
              tripSegments={priorNotificationDetail.logbookMessage.tripSegments}
              types={getPriorNotificationTypesFromLogbookMessagePnoTypes(
                priorNotificationDetail.logbookMessage.message.pnoTypes
              )}
            />

            <Intro>
              Le préavis doit être vérifié par le CNSP avant sa diffusion.
              <br />
              Le navire doit respecter un délai d’envoi et débarquer dans un port désigné.
            </Intro>

            <hr />

            <LogbookMessage
              isFirst
              isLessThanTwelveMetersVessel={priorNotificationDetail.isLessThanTwelveMetersVessel}
              logbookMessage={priorNotificationDetail.logbookMessage}
            />

            <hr />

            <Formik
              initialValues={{ note: priorNotificationDetail.logbookMessage.message.note }}
              onSubmit={() => {}}
              validateOnChange={false}
            >
              <>
                <FormikEffect onChange={values => updateNote(values.note)} />
                <FieldGroup>
                  <FormikTextarea
                    label="Points d'attention identifiés par le CNSP"
                    name="note"
                    readOnly={isPendingSend || isSent || !isSuperUser}
                  />
                </FieldGroup>
              </>
            </Formik>
          </Body>

          <Footer>
            <Button accent={Accent.TERTIARY} onClick={close}>
              Fermer
            </Button>

            <DownloadButton pnoLogbookMessage={priorNotificationDetail.logbookMessage} />

            <Button
              accent={Accent.PRIMARY}
              disabled={isPendingSend || isSent}
              Icon={isSent ? Icon.Check : Icon.Send}
              onClick={verifyAndSend}
            >
              {isSent ? 'Diffusé' : 'Diffuser'}
            </Button>
          </Footer>
        </FrontendErrorBoundary>
      </Card>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
`

const Background = styled.div`
  background-color: ${p => p.theme.color.charcoal};
  opacity: 0.5;
  flex-grow: 1;
`

const Card = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 560px;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 32px;

  > hr {
    margin: 24px 0;
  }
`

const Intro = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`

const Footer = styled.div`
  border-top: 1px solid ${p => p.theme.color.lightGray};
  display: flex;
  justify-content: flex-end;
  padding: 16px 32px;
  height: 30px;

  > .Element-Button:not(:first-child) {
    margin-left: 8px;
  }

  > div {
    margin-left: 8px;
  }
`

const FieldGroup = styled.div.attrs({ className: 'FieldGroup' })`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .rs-checkbox {
    > .rs-checkbox-checker {
      > label {
        line-height: 18px;
      }
    }
  }

  textarea {
    box-sizing: border-box !important;
  }
`
