import { Accent, Button, Dialog, FormikDatePicker, Icon, useNewWindow } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import { AlertTypeField } from './fields/AlertTypeField'
import { VesselField } from './fields/VesselField'
import { SilencedAlertSchema } from './schemas'
import { emptySilencedAlert } from './types'
import { getSilencedAlertFromSilencedAlertFormValues } from './utils'
import { SilencedAlertData } from '../../../../domain/entities/alerts/types'

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
          <StyledDialogTitle>Suspendre une alerte</StyledDialogTitle>
          <StyledBody>
            <>
              <VesselField />
              <AlertTypeField />
              <StyledFormikDatePicker
                baseContainer={newWindowContainerRef.current}
                isStringDate
                label="Date de reprise"
                name="silencedBeforeDate"
              />
            </>
          </StyledBody>

          <Dialog.Action>
            <Button accent={Accent.TERTIARY} onClick={onCancel}>
              Annuler
            </Button>
            <Button
              accent={Accent.PRIMARY}
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
  padding: 20px 20px;
  text-align: left;

  .Element-FieldError {
    color: ${p => p.theme.color.maximumRed};
  }
`

const StyledFormikDatePicker = styled(FormikDatePicker)`
  margin-top: 30px;

  > legend {
    font-weight: 400;
  }
`

// TODO Remove that once we get rid of global legacy CSS.
const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
  margin: 0;
`
