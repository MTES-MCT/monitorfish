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
import { InfractionGroup } from './types'
import { InfractionFormLiveSchema } from '../../schemas'
import { INFRACTION_TYPES_AS_OPTIONS } from '../constants'

import type { MissionAction } from '../../../../../../domain/types/missionAction'

export type InfractionFormProps = {
  initialValues: MissionAction.Infraction & { group?: string | undefined }
  isEdition?: boolean
  natinfsAsOptions: Option<number>[]
  onCancel: () => void
  onSubmit: (nextInfractionFormValues: MissionAction.Infraction, infractionGroup: string) => void
}
export function InfractionForm({
  initialValues,
  isEdition = false,
  natinfsAsOptions,
  onCancel,
  onSubmit
}: InfractionFormProps) {
  const { newWindowContainerRef } = useNewWindow()
  const [infractionGroup, setInfractionGroup] = useState<string>(
    initialValues.group || InfractionGroup.GEAR_INFRACTIONS
  )

  const infractionGroupOptions = Object.keys(InfractionGroup).map(group => {
    const groupValue = InfractionGroup[group]

    return {
      label: infractionGroupToLabel[groupValue],
      value: groupValue
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
          <Columns>
            <FormikMultiRadio
              isErrorMessageHidden
              isInline
              label="Type d’infraction"
              name="infractionType"
              options={INFRACTION_TYPES_AS_OPTIONS}
            />
            <StyledGroupSelect
              baseContainer={newWindowContainerRef.current}
              cleanable={false}
              disabled={isEdition}
              label="Groupe"
              name="infraction-group"
              onChange={group => {
                if (isEdition) {
                  return
                }

                setInfractionGroup(group as string)
              }}
              options={infractionGroupOptions}
              value={infractionGroup}
            />
          </Columns>
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

const StyledGroupSelect = styled(Select)`
  margin-left: 16px;
  max-width: 350px;
`

const Columns = styled.div`
  display: flex;
`

const StyledForm = styled(Form)`
  background-color: transparent;
  border: 0;
  padding: 0;

  > .Element-Field,
  > .Element-Fieldset {
    margin-top: 16px;
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
