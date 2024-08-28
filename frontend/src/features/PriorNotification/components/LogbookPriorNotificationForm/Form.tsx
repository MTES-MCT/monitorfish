import { ConfirmationModal } from '@components/ConfirmationModal'
import { HALF_A_SECOND } from '@constants/index'
import { duplicateLogbookPriorNotification } from '@features/PriorNotification/useCases/duplicateLogbookPriorNotification'
import { invalidatePriorNotification } from '@features/PriorNotification/useCases/invalidatePriorNotification'
import { updateLogbookPriorNotification } from '@features/PriorNotification/useCases/updateLogbookPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, FormikEffect, FormikTextarea, FormikTextInput, Icon, THEME } from '@mtes-mct/monitor-ui'
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

  const priorNotificationIdentifier = useMemo(() => getPriorNotificationIdentifier(detail), [detail])
  assertNotNullish(priorNotificationIdentifier)

  const isBeingSent = !!detail.logbookMessage.message.isBeingSent
  const isInvalidated = !!detail.logbookMessage.message.isInvalidated
  const isReadOnly = !isSuperUser || isBeingSent || isInvalidated

  const closeInvalidationConfirmationModal = () => {
    setIsInvalidationConfirmationModalOpen(false)
  }

  const duplicate = () => {
    dispatch(duplicateLogbookPriorNotification(priorNotificationIdentifier))
  }

  const invalidate = () => {
    dispatch(invalidatePriorNotification(priorNotificationIdentifier, false))
  }

  const openInvalidationConfirmationModal = () => {
    setIsInvalidationConfirmationModalOpen(true)
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

      {isSuperUser && (
        <ActionWrapper>
          {!isInvalidated && (
            <Button
              accent={Accent.SECONDARY}
              color={THEME.color.maximumRed}
              disabled={isBeingSent}
              Icon={Icon.Invalid}
              onClick={openInvalidationConfirmationModal}
            >
              Invalider le préavis
            </Button>
          )}
          <Button
            accent={Accent.SECONDARY}
            disabled={isBeingSent || !isInvalidated}
            Icon={Icon.Duplicate}
            onClick={duplicate}
            title={!isInvalidated ? 'Le préavis doit d’abord être invalidé pour pouvoir être dupliqué.' : undefined}
          >
            Créer un préavis manuel à partir de ce préavis
          </Button>
        </ActionWrapper>
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

const ActionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 48px;
  row-gap: 8px;
`
