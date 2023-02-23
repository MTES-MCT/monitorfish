import {
  Accent,
  Button,
  FormikCheckbox,
  FormikMultiRadio,
  FormikSelect,
  FormikTextarea,
  Icon,
  Option
} from '@mtes-mct/monitor-ui'
import { Form, Formik, useField } from 'formik'
import { remove as ramdaRemove, update } from 'ramda'
import { Fragment, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Infraction } from './Infraction'
import { useGetInfractionsQuery } from '../../../../../../api/infraction'
import { FrontendError } from '../../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../../ui/NewWindow'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../../FieldsetGroup'
import { FieldsetGroupSeparator } from '../../../FieldsetGroupSeparator'
import { INFRACTION_TYPES_AS_OPTIONS, MissionActionInfractionSchema } from '../constants'

import type { MissionAction } from '../../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../../types'
import type { FormikCheckboxProps, FormikTextareaProps } from '@mtes-mct/monitor-ui'
import type { ReactNode } from 'react'

export type FormikMultiInfractionPickerProps = {
  addButtonLabel: string
  children?: ReactNode
  generalObservationTextareaProps?: Omit<FormikTextareaProps, 'name'> & {
    name: keyof MissionActionFormValues
  }
  infractionCheckboxProps?: FormikCheckboxProps
  label: string
  name: keyof MissionActionFormValues
}
export function FormikMultiInfractionPicker({
  addButtonLabel,
  children,
  generalObservationTextareaProps,
  infractionCheckboxProps,
  label,
  name
}: FormikMultiInfractionPickerProps) {
  const [input, , helper] = useField<MissionAction.OtherInfraction[] | undefined>(name)

  const { newWindowContainerRef } = useNewWindow()

  const [isEditedIndexNew, setIsEditedIndexNew] = useState(false)
  const [editedIndex, setEditedIndex] = useState<number | undefined>(undefined)

  const getInfractionsApiQuery = useGetInfractionsQuery()

  const natinfsAsOptions: Option<number>[] = useMemo(() => {
    if (!getInfractionsApiQuery.data) {
      return []
    }

    return getInfractionsApiQuery.data.map(({ infraction, natinfCode }) => ({
      label: `${natinfCode} - ${infraction}`,
      value: Number(natinfCode)
    }))
  }, [getInfractionsApiQuery.data])

  const add = useCallback(
    () => {
      const nextInfractions = [...(input.value || []), {}] as MissionAction.OtherInfraction[]

      helper.setValue(nextInfractions)

      setIsEditedIndexNew(true)
      setEditedIndex(nextInfractions.length - 1)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const closeForm = useCallback(() => {
    setEditedIndex(undefined)
    setIsEditedIndexNew(false)
  }, [])

  const remove = useCallback(
    (index: number) => {
      if (!input.value) {
        throw new FrontendError('`input.value` is undefined. This should never happen.', 'remove()')
      }

      const nextInfractions = ramdaRemove(index, 1, input.value)
      const nornalizedNextInfractions = nextInfractions.length > 0 ? nextInfractions : undefined

      helper.setValue(nornalizedNextInfractions)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const cancel = useCallback(() => {
    if (editedIndex === undefined) {
      throw new FrontendError('`editedIndex` is undefined. This should never happen.', 'acancel()')
    }

    // If we clicked the cancellation button and the edition form was for a new item, we delete it
    if (isEditedIndexNew) {
      remove(editedIndex)
    }

    closeForm()
  }, [closeForm, editedIndex, isEditedIndexNew, remove])

  const submit = useCallback(
    (updatedInfraction: MissionAction.OtherInfraction) => {
      if (!input.value || editedIndex === undefined) {
        throw new FrontendError('`input.value` or `editedIndex` is undefined. This should never happen.', 'submit()')
      }

      const nextInfractions = update(editedIndex, updatedInfraction, input.value)

      helper.setValue(nextInfractions)

      closeForm()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeForm, editedIndex, input.value]
  )

  if (!natinfsAsOptions.length) {
    return <FieldsetGroupSpinner isLight legend={label} />
  }

  return (
    <FieldsetGroup isLight legend={label}>
      {children}

      <Button accent={Accent.SECONDARY} disabled={isEditedIndexNew} Icon={Icon.Plus} isFullWidth onClick={add}>
        {addButtonLabel}
      </Button>

      {input.value && input.value.length > 0 && (
        <Row>
          {input.value.map((infraction, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`${name}-infraction-${index}`}>
              <FieldsetGroupSeparator />

              {index !== editedIndex && (
                <Infraction data={infraction} index={index} onDelete={remove} onEdit={setEditedIndex} />
              )}

              {index === editedIndex && (
                <Formik initialValues={infraction} onSubmit={submit} validationSchema={MissionActionInfractionSchema}>
                  {({ isValid }) => (
                    <StyledForm>
                      <FormikMultiRadio
                        isInline
                        label="Type d’infraction"
                        name="infractionType"
                        options={INFRACTION_TYPES_AS_OPTIONS}
                      />
                      {/* TODO I don't understand if it's a multiselect or a select here (XD vs types). */}
                      <HackedFormikSelect
                        baseContainer={newWindowContainerRef.current}
                        label="NATINF"
                        name="natinf"
                        options={natinfsAsOptions}
                        searchable
                      />
                      {infractionCheckboxProps && (
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        <FormikCheckbox {...infractionCheckboxProps} />
                      )}
                      <FormikTextarea label="Observations sur l’infraction" name="comments" />

                      <FormButtonGroup>
                        <Button accent={Accent.TERTIARY} onClick={cancel}>
                          Annuler
                        </Button>
                        <Button accent={Accent.PRIMARY} disabled={!isValid} type="submit">
                          Valider l’infraction
                        </Button>
                      </FormButtonGroup>
                    </StyledForm>
                  )}
                </Formik>
              )}
            </Fragment>
          ))}
        </Row>
      )}

      {generalObservationTextareaProps && (
        <>
          <FieldsetGroupSeparator />

          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <FormikTextarea {...generalObservationTextareaProps} />
        </>
      )}
    </FieldsetGroup>
  )
}

const Row = styled.div`
  > legend {
    margin: 24px 0 8px;
  }
`

const StyledForm = styled(Form)`
  background-color: transparent;
  border: 0;
  padding: 0;

  > div:first-child,
  > fieldset:first-child {
    margin-top: 16px;
  }

  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }
`

const FormButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;

  > button:last-child {
    margin-left: 16px;
  }
`

const HackedFormikSelect = styled(FormikSelect)`
  > .rs-picker-toggle {
    /* TODO Investigate both these props which are a hack to fix long NATINFs breaking the layout. */
    max-width: 312px;
  }
`
