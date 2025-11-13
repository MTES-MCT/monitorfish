import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { ContactMethodSchema } from '@features/Vessel/schemas/ContactMethodSchema'
import {
  useCreateVesselContactMethodMutation,
  useGetVesselContactToUpdateQuery,
  useUpdateVesselContactMethodMutation
} from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, FormikCheckbox, FormikTextarea, Level } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { toFormikValidationSchema } from '@utils/toFormikValidationSchema'
import { Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'
import { LoadingSpinnerWall } from '../../../../../ui/LoadingSpinnerWall'

import type { Vessel } from '@features/Vessel/Vessel.types'

type VesselContactToUpdateFormProps = {
  vesselId: number | undefined
}

export function VesselContactToUpdateForm({ vesselId }: VesselContactToUpdateFormProps) {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const [createVesselContactToUpdate] = useCreateVesselContactMethodMutation()
  const [updateVesselContactToUpdate] = useUpdateVesselContactMethodMutation()
  const { data: vesselContactToUpdate, isLoading, refetch } = useGetVesselContactToUpdateQuery(vesselId ?? skipToken)
  const [formValue, setFormValue] = useState<Vessel.ContactMethod | undefined>()

  useEffect(() => {
    if (vesselContactToUpdate) {
      setFormValue(vesselContactToUpdate)
    }
  }, [vesselContactToUpdate])

  if (!vesselId) {
    return null
  }

  const onSave = async (vesselContactToUpdateToSave: Vessel.ContactMethod) => {
    const isCreation = !vesselContactToUpdateToSave.id

    const cleanedData = ContactMethodSchema.strip().parse(vesselContactToUpdateToSave)

    if (isCreation) {
      await createVesselContactToUpdate(cleanedData).unwrap()
    } else {
      await updateVesselContactToUpdate(cleanedData).unwrap()
    }
    dispatch(
      addMainWindowBanner({
        children: "La modalité de contact avec l'unité a été mise à jour",
        isClosable: true,
        isFixed: true,
        level: Level.SUCCESS,
        withAutomaticClosing: true
      })
    )
    refetch()
  }

  return isLoading ? (
    <LoadingSpinnerWall isVesselShowed />
  ) : (
    <Formik
      enableReinitialize
      initialValues={
        formValue ?? {
          contactMethod: undefined,
          contactMethodShouldBeChecked: false,
          id: undefined,
          vesselId
        }
      }
      onSubmit={onSave}
      validate={toFormikValidationSchema(ContactMethodSchema)}
    >
      {({ dirty, resetForm }) => (
        <ContactForm>
          <StyledFormikTextarea label="Modalité de contact avec l'unité" name="contactMethod" readOnly={!isSuperUser} />
          <Footer>
            <FormikCheckbox
              label="Contact à mettre à jour"
              name="contactMethodShouldBeChecked"
              readOnly={!isSuperUser}
            />
            {dirty && (
              <Controls>
                <Button accent={Accent.SECONDARY} onClick={() => resetForm()}>
                  Annuler
                </Button>
                <Button type="submit">Valider</Button>
              </Controls>
            )}
          </Footer>
        </ContactForm>
      )}
    </Formik>
  )
}

const StyledFormikTextarea = styled(FormikTextarea)``

const ContactForm = styled(Form)`
  background-color: ${p => p.theme.color.white};
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
`

const Controls = styled.div`
  display: flex;
  gap: 8px;
`
