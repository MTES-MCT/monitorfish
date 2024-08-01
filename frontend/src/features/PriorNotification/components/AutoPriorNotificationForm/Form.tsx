import { HALF_A_SECOND } from '@constants/index'
import { useInvalidatePriorNotificationMutation } from '@features/PriorNotification/priorNotificationApi'
import { updateAutoPriorNotification } from '@features/PriorNotification/useCases/updateAutoPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, FormikEffect, FormikTextarea, FormikTextInput, Icon } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { InvalidatePriorNotificationDialog } from '../InvalidatePriorNotificationDialog'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type FormProps = Readonly<{
  detail: PriorNotification.PriorNotificationDetail
  initialFormValues: PriorNotification.AutoPriorNotificationData
}>
export function Form({ detail, initialFormValues }: FormProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  const [invalidatePriorNotification] = useInvalidatePriorNotificationMutation()

  const [isInvalidatingPriorNotificationDialog, setIsInvalidatingPriorNotificationDialog] = useState(false)

  const priorNotificationIdentifier = useMemo(() => getPriorNotificationIdentifier(detail), [detail])
  assertNotNullish(priorNotificationIdentifier)

  const { isInvalidated } = detail.logbookMessage.message

  const invalidate = async () => {
    await invalidatePriorNotification({
      isManuallyCreated: detail.isManuallyCreated,
      operationDate: priorNotificationIdentifier.operationDate,
      reportId: priorNotificationIdentifier.reportId
    })

    setIsInvalidatingPriorNotificationDialog(false)
  }

  const updateNoteCallback = useCallback(
    async (nextValues: PriorNotification.AutoPriorNotificationData) => {
      await dispatch(updateAutoPriorNotification(priorNotificationIdentifier, nextValues))
    },
    [dispatch, priorNotificationIdentifier]
  )

  const updateNote = useDebouncedCallback(
    (nextValues: PriorNotification.AutoPriorNotificationData) => updateNoteCallback(nextValues),
    HALF_A_SECOND
  )

  return (
    <>
      <Formik initialValues={initialFormValues} onSubmit={noop}>
        <>
          <FormikEffect onChange={updateNote as any} />

          <FieldGroup>
            <FormikTextarea label="Points d'attention identifiés par le CNSP" name="note" />
          </FieldGroup>

          <AuthorTrigramInput label="Par" name="authorTrigram" />
        </>
      </Formik>

      {isSuperUser && !isInvalidated && (
        <InvalidateButton
          accent={Accent.SECONDARY}
          Icon={Icon.Invalid}
          onClick={() => setIsInvalidatingPriorNotificationDialog(true)}
          title="Invalider le préavis"
        >
          Invalider le préavis
        </InvalidateButton>
      )}

      {isInvalidatingPriorNotificationDialog && (
        <InvalidatePriorNotificationDialog
          onCancel={() => setIsInvalidatingPriorNotificationDialog(false)}
          onConfirm={invalidate}
        />
      )}
    </>
  )
}

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

const AuthorTrigramInput = styled(FormikTextInput)`
  width: 120px;
`

const InvalidateButton = styled(Button)`
  color: ${p => p.theme.color.maximumRed};
  margin-top: 48px;
`
