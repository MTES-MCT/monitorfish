import { useGetThreatCharacterizationAsTreeOptions } from '@features/Infraction/hooks/useGetThreatCharacterizationAsTreeOptions'
import { Accent, Button, CheckTreePicker, FormikMultiRadio, FormikTextarea } from '@mtes-mct/monitor-ui'
import { Form, Formik } from 'formik'
import styled from 'styled-components'

import { InfractionFormLiveSchema } from '../../schemas'
import { INFRACTION_TYPES_AS_OPTIONS } from '../constants'

import type { MissionAction } from '@features/Mission/missionAction.types'

type InfractionFormProps = Readonly<{
  initialValues: MissionAction.Infraction
  onCancel: () => void
  onSubmit: (nextInfractionFormValues: MissionAction.Infraction) => void
}>
export function InfractionForm({ initialValues, onCancel, onSubmit }: InfractionFormProps) {
  const threatCharacterizationOptions = useGetThreatCharacterizationAsTreeOptions(initialValues.threats)

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => onSubmit(values)}
      validationSchema={InfractionFormLiveSchema}
    >
      {({ isValid, setFieldValue, values }) => (
        <StyledForm>
          <FormikMultiRadio
            isErrorMessageHidden
            isInline
            isRequired
            label="Résultat de l’infraction"
            name="infractionType"
            options={INFRACTION_TYPES_AS_OPTIONS}
          />
          <HackedCheckTreePicker
            isErrorMessageHidden
            isRequired
            isSelect
            label="Type d’infraction et NATINF"
            name="threats"
            onChange={nextThreats => {
              setFieldValue('threats', nextThreats)
            }}
            options={threatCharacterizationOptions}
            searchable
            value={values.threats}
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

    &:first-child {
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

// TODO We can't use the Formik component to to rendering issue:
// -> On first click on Select, the list is not displayed, we need to double click the Select to display the list
const HackedCheckTreePicker = styled(CheckTreePicker)`
  .rs-picker-toggle {
    /* TODO Investigate both these props which are a hack to fix long NATINFs breaking the layout. */
    max-width: 600px !important;
  }
`
