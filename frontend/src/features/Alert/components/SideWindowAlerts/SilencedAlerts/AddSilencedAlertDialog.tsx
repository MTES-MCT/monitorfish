import { Accent, Button, Dialog, FormikDatePicker, Icon, useNewWindow } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import { AlertNameField } from './fields/AlertNameField'
import { VesselField } from './fields/VesselField'
import { SilencedAlertSchema } from './schemas'
import { emptySilencedAlert } from './types'
import { getSilencedAlertFromSilencedAlertFormValues } from './utils'

import type { SilencedAlertData } from '../../../types'
import type { Promisable } from 'type-fest'

type DeletionConfirmationDialogProps = {
  onCancel: () => Promisable<void>
  onConfirm: (nextSilencedAlert: SilencedAlertData) => Promisable<void>
}
export function AddSilencedAlertDialog({ onCancel, onConfirm }: DeletionConfirmationDialogProps) {
  const { newWindowContainerRef } = useNewWindow()
  const [isValidatingOnChange, setIsValidatingOnChange] = useState(false)

  return (
    <Formik
      initialValues={emptySilencedAlert}
      onSubmit={values => {
        onConfirm(getSilencedAlertFromSilencedAlertFormValues(values))
      }}
      validateOnBlur={isValidatingOnChange}
      validateOnChange={isValidatingOnChange}
      validationSchema={SilencedAlertSchema}
    >
      {({ handleSubmit }) => (
        <Dialog isAbsolute>
          <Dialog.Title onClose={onCancel}>Suspendre une alerte</Dialog.Title>
          <StyledBody>
            <VesselField />
            <AlertNameField />
            <FormikDatePicker
              baseContainer={newWindowContainerRef.current}
              isStringDate
              label="Date de reprise"
              name="silencedBeforeDate"
            />
          </StyledBody>

          <Dialog.Action>
            <Button accent={Accent.SECONDARY} onClick={onCancel}>
              Annuler
            </Button>
            <Button
              Icon={Icon.Save}
              onClick={() => {
                handleSubmit()
                setIsValidatingOnChange(true)
              }}
              type="submit"
            >
              Enregistrer
            </Button>
          </Dialog.Action>
        </Dialog>
      )}
    </Formik>
  )
}

const StyledBody = styled(Dialog.Body)`
  overflow-y: inherit;
  gap: 16px;
  .Element-FieldError {
    color: ${p => p.theme.color.maximumRed};
  }
`
