import {
  Accent,
  Button,
  FormikMultiRadio,
  FormikSelect,
  FormikTextarea,
  type Option,
  useNewWindow,
  Select
} from '@mtes-mct/monitor-ui'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import { infractionGroupToLabel } from './constants'
import { InfractionCategory } from './types'
import { InfractionFormLiveSchema } from '../../schemas'
import { INFRACTION_TYPES_AS_OPTIONS } from '../constants'

import type { MissionAction } from 'domain/types/missionAction'

export type InfractionFormProps = {
  initialValues: MissionAction.Infraction & { group?: string | undefined }
  isEdition?: boolean
  natinfsAsOptions: Option<number>[]
  onCancel: () => void
  onSubmit: (nextInfractionFormValues: MissionAction.Infraction, infractionGroup: string | undefined) => void
}
export function InfractionForm({
  initialValues,
  isEdition = false,
  natinfsAsOptions,
  onCancel,
  onSubmit
}: InfractionFormProps) {
  const { newWindowContainerRef } = useNewWindow()
  const [infractionGroup, setInfractionGroup] = useState<string | undefined>(initialValues.group || undefined)

  const infractionCategoryOptions = Object.keys(InfractionCategory).map(category => {
    const categoryValue = InfractionCategory[category]

    return {
      label: infractionGroupToLabel[categoryValue],
      value: categoryValue
    }
  })

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => onSubmit(values, infractionGroup)}
      validationSchema={InfractionFormLiveSchema}
    >
      {({ isValid }) => (
        <StyledForm>
          <FormikMultiRadio
            isErrorMessageHidden
            isInline
            label="Résultat de l’infraction"
            name="infractionType"
            options={INFRACTION_TYPES_AS_OPTIONS}
          />
          <Select
            baseContainer={newWindowContainerRef.current}
            cleanable={false}
            disabled={isEdition}
            label="Catégorie d’infraction"
            name="infraction-group"
            onChange={category => {
              if (isEdition) {
                return
              }

              setInfractionGroup(category as string)
            }}
            options={infractionCategoryOptions}
            value={infractionGroup}
          />
          <HackedFormikSelect
            baseContainer={newWindowContainerRef.current}
            isErrorMessageHidden
            label="NATINF"
            name="natinf"
            options={natinfsAsOptions}
            searchable
          />
          <FormikTextarea isErrorMessageHidden label="Observations sur l’infraction" name="comments" rows={2} />

          <FormButtonGroup>
            <Button accent={Accent.TERTIARY} onClick={onCancel}>
              Annuler
            </Button>
            <Button accent={Accent.PRIMARY} disabled={!isValid} type="submit">
              Valider l’infraction
            </Button>
          </FormButtonGroup>
        </StyledForm>
      )}
    </Formik>
  )
}

const StyledForm = styled(Form)`
  background-color: transparent;
  border: 0;
  padding: 0;

  > .Element-Field,
  > .Element-Fieldset {
    margin-top: 16px;

    :first-child {
      margin-top: 0px;
    }
  }
`

const FormButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  > button:last-child {
    margin-left: 16px;
  }
`

const HackedFormikSelect = styled(FormikSelect)`
  .rs-picker-toggle {
    /* TODO Investigate both these props which are a hack to fix long NATINFs breaking the layout. */
    max-width: 312px !important;
  }
`
