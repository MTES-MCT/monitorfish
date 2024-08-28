import { ConfirmationModal } from '@components/ConfirmationModal'
import { HALF_A_SECOND } from '@constants/index'
import { invalidateAndDuplicateLogbookPriorNotification } from '@features/PriorNotification/useCases/invalidateAndDuplicateLogbookPriorNotification'
import { invalidatePriorNotification } from '@features/PriorNotification/useCases/invalidatePriorNotification'
import { updateLogbookPriorNotification } from '@features/PriorNotification/useCases/updateLogbookPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, FormikEffect, FormikTextarea, FormikTextInput, Icon } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { Formik } from 'formik'
import { noop, isEqual } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type FormProps = Readonly<{
  detail: PriorNotification.Detail
  initialFormValues: PriorNotification.LogbookForm
}>
export function Form({ detail, initialFormValues }: FormProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()

  const [isInvalidationConfirmationModalOpen, setIsInvalidationConfirmationModalOpen] = useState(false)
  const [isInvalidationWithDuplicationConfirmationModalOpen, setIsInvalidationWithDuplicationConfirmationModalOpen] =
    useState(false)

  const priorNotificationIdentifier = useMemo(() => getPriorNotificationIdentifier(detail), [detail])
  assertNotNullish(priorNotificationIdentifier)

  const { isBeingSent, isInvalidated } = detail.logbookMessage.message
  const isReadOnly = !isSuperUser || !!isBeingSent || isInvalidated

  const closeInvalidationConfirmationModal = () => {
    setIsInvalidationConfirmationModalOpen(false)
  }

  const closeInvalidationWithDuplicationConfirmationModal = () => {
    setIsInvalidationWithDuplicationConfirmationModalOpen(false)
  }

  const invalidate = () => {
    dispatch(invalidatePriorNotification(priorNotificationIdentifier, false))
  }

  const invalidateAndDuplicate = () => {
    dispatch(invalidateAndDuplicateLogbookPriorNotification(priorNotificationIdentifier))
  }

  const openInvalidationConfirmationModal = () => {
    setIsInvalidationConfirmationModalOpen(true)
  }

  const openInvalidationWithDuplicationConfirmationModal = () => {
    setIsInvalidationWithDuplicationConfirmationModalOpen(true)
  }

  const updateFormCallback = useCallback(
    async (nextValues: PriorNotification.LogbookForm) => {
      if (isEqual(nextValues, initialFormValues)) {
        return
      }

      await dispatch(updateLogbookPriorNotification(priorNotificationIdentifier, nextValues))
    },
    [dispatch, priorNotificationIdentifier, initialFormValues]
  )

  const updateNote = useDebouncedCallback(
    (nextValues: PriorNotification.LogbookForm) => updateFormCallback(nextValues),
    HALF_A_SECOND
  )

  return (
    <>
      <Formik initialValues={initialFormValues} onSubmit={noop}>
        <>
          {!isReadOnly && <FormikEffect onChange={updateNote as any} />}

          <FieldGroup>
            <FormikTextarea label="Points d'attention identifiés par le CNSP" name="note" readOnly={isReadOnly} />
          </FieldGroup>

          {isSuperUser && <AuthorTrigramInput label="Par" name="authorTrigram" readOnly={isReadOnly} />}
        </>
      </Formik>

      {isSuperUser && !isInvalidated && (
        <>
          <InvalidateButton
            accent={Accent.SECONDARY}
            disabled={isReadOnly}
            Icon={Icon.Invalid}
            onClick={openInvalidationConfirmationModal}
            title="Invalider le préavis"
          >
            Invalider le préavis
          </InvalidateButton>

          <InvalidateButton
            accent={Accent.SECONDARY}
            disabled={isReadOnly}
            Icon={Icon.Invalid}
            onClick={openInvalidationWithDuplicationConfirmationModal}
            title="Invalider et recréer le préavis"
          >
            Invalider et recréer le préavis
          </InvalidateButton>
        </>
      )}

      {isInvalidationConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer l’invalidation"
          message={
            <>
              <p>
                <b>Êtes-vous sûr de vouloir invalider ce préavis ?</b>
              </p>
              <p>Vous ne pourrez plus le modifier ni le diffuser aux unités. Vous pourrez toujours le consulter.</p>
            </>
          }
          onCancel={closeInvalidationConfirmationModal}
          onConfirm={invalidate}
          title="Invalider le préavis"
        />
      )}
      {isInvalidationWithDuplicationConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer l’invalidation avec recréation"
          message="Êtes-vous sûr de vouloir invalider et recréer ce préavis ?"
          onCancel={closeInvalidationWithDuplicationConfirmationModal}
          onConfirm={invalidateAndDuplicate}
          title="Invalider et recréer le préavis"
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
