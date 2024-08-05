import { RTK_FORCE_REFETCH_QUERY_OPTIONS, RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS } from '@api/constants'
import { ErrorWall } from '@components/ErrorWall'
import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { LogbookMessage } from '@features/Logbook/components/VesselLogbook/LogbookMessages/messages/LogbookMessage'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import {
  useGetPriorNotificationDetailQuery,
  useInvalidatePriorNotificationMutation
} from '@features/PriorNotification/priorNotificationApi'
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
import { skipToken } from '@reduxjs/toolkit/query'
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
  const openedPriorNotificationIdentity = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationIdentifier
  )
  const isOpenedPriorNotificationManuallyCreated = useMainAppSelector(
    state => state.priorNotification.isOpenedPriorNotificationManuallyCreated
  )
  const { data: priorNotificationDetail } = useGetPriorNotificationDetailQuery(
    openedPriorNotificationIdentity && typeof isOpenedPriorNotificationManuallyCreated === 'boolean'
      ? {
          ...openedPriorNotificationIdentity,
          isManuallyCreated: isOpenedPriorNotificationManuallyCreated
        }
      : skipToken,
    {
      ...RTK_ONE_MINUTE_POLLING_QUERY_OPTIONS,
      ...RTK_FORCE_REFETCH_QUERY_OPTIONS
    }
  )
  const [invalidatePriorNotification] = useInvalidatePriorNotificationMutation()
  const sideWindowPriorNotificationCardError = useMainAppSelector(
    state => state.displayedError.sideWindowPriorNotificationCardError
  )

  const [isLoading, setIsLoading] = useState(false)
  const isInvalidated = priorNotificationDetail?.logbookMessage?.message?.isInvalidated
  const isPendingSend =
    !!priorNotificationDetail?.state &&
    [PriorNotification.State.AUTO_SEND_IN_PROGRESS, PriorNotification.State.PENDING_SEND].includes(
      priorNotificationDetail?.state
    )
  const isVerifiedAndSent = priorNotificationDetail?.state === PriorNotification.State.VERIFIED_AND_SENT
  const isPendingVerification = priorNotificationDetail?.state === PriorNotification.State.PENDING_VERIFICATION
  const hasDesignatedPorts = priorNotificationDetail?.logbookMessage?.message?.pnoTypes?.find(
    type => type.hasDesignatedPorts
  )

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCard())
  }

  const verifyAndSend = async () => {
    setIsLoading(true)

    assertNotNullish(openedPriorNotificationIdentity)

    await dispatch(verifyAndSendPriorNotification(openedPriorNotificationIdentity, false))

    setIsLoading(false)
  }

  const invalidate = async () => {
    setIsLoading(true)

    assertNotNullish(openedPriorNotificationIdentity)

    await invalidatePriorNotification({
      isManuallyCreated: isOpenedPriorNotificationManuallyCreated,
      operationDate: openedPriorNotificationIdentity.operationDate,
      reportId: openedPriorNotificationIdentity.reportId
    })

    setIsLoading(false)
  }

  const updateNoteCallback = useCallback(
    async (nextNote: string | undefined) => {
      assertNotNullish(openedPriorNotificationIdentity)
      assertNotNullish(priorNotificationDetail)

      if (nextNote === priorNotificationDetail.logbookMessage.message.note) {
        return
      }

      await dispatch(updatePriorNotificationNote(openedPriorNotificationIdentity, nextNote))
    },
    [dispatch, openedPriorNotificationIdentity, priorNotificationDetail]
  )

  const updateNote = useDebouncedCallback(
    (nextNote: string | undefined) => updateNoteCallback(nextNote),
    DEBOUNCE_DELAY
  )

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
              isInvalidated={isInvalidated}
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

            {isPendingVerification && <Intro>Le préavis doit être vérifié par le CNSP avant sa diffusion.</Intro>}
            <Intro hasNoTopMargin={isPendingVerification}>
              Le navire doit respecter un délai d’envoi{hasDesignatedPorts && ' et débarquer dans un port désigné'}.
            </Intro>

            <hr />

            <LogbookMessage
              isFirst
              isManuallyCreated={isOpenedPriorNotificationManuallyCreated ?? false}
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
                    readOnly={!isSuperUser || isInvalidated}
                  />
                </FieldGroup>
              </>
            </Formik>

            {isSuperUser && (
              <InvalidateButton
                accent={Accent.SECONDARY}
                disabled={isInvalidated}
                Icon={Icon.Invalid}
                iconSize={17}
                onClick={invalidate}
                title="Invalider le préavis"
              >
                Invalider le préavis
              </InvalidateButton>
            )}
          </Body>

          <Footer>
            <Button accent={Accent.TERTIARY} onClick={close}>
              Fermer
            </Button>

            <DownloadButton
              pnoLogbookMessage={priorNotificationDetail.logbookMessage}
              reportId={priorNotificationDetail.id}
            />

            <Button
              accent={Accent.PRIMARY}
              disabled={isInvalidated || isPendingSend || isVerifiedAndSent}
              Icon={isVerifiedAndSent ? Icon.Check : Icon.Send}
              onClick={verifyAndSend}
              title={
                isInvalidated
                  ? "Le préavis est invalidé, il n'est plus possible de le modifier ni de le diffuser."
                  : undefined
              }
            >
              {isVerifiedAndSent ? 'Diffusé' : 'Diffuser'}
            </Button>
          </Footer>
        </FrontendErrorBoundary>
      </Card>
    </Wrapper>
  )
}

const InvalidateButton = styled(Button)`
  color: ${p => p.theme.color.maximumRed};
  margin-top: 48px;
`

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

const Intro = styled.p<{
  hasNoTopMargin?: boolean
}>`
  ${p => p.hasNoTopMargin && 'margin-top: 2px;'}
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
