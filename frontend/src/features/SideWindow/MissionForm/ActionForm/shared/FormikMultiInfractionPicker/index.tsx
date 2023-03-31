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
import { FieldsetGroup, FieldsetGroupSpinner } from '../../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../../shared/FieldsetGroupSeparator'
import { INFRACTION_TYPES_AS_OPTIONS, MissionActionInfractionSchema } from '../constants'

import type { MissionAction } from '../../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../../types'
import type { FormikCheckboxProps, FormikTextareaProps } from '@mtes-mct/monitor-ui'
import type { ReactNode } from 'react'

export type FormikMultiInfractionPickerProps<AnyInfraction extends MissionAction.OtherInfraction> = {
  addButtonLabel: string
  children?: ReactNode
  generalObservationTextareaProps?: Omit<FormikTextareaProps, 'name'> & {
    name: keyof MissionActionFormValues
  }
  infractionCheckboxProps?: FormikCheckboxProps
  label: string
  name: keyof MissionActionFormValues
  seizurePropName?: keyof AnyInfraction
  seizureTagLabel?: string
}
export function FormikMultiInfractionPicker<AnyInfraction extends MissionAction.OtherInfraction>({
  addButtonLabel,
  children,
  generalObservationTextareaProps,
  infractionCheckboxProps,
  label,
  name,
  seizurePropName,
  seizureTagLabel
}: FormikMultiInfractionPickerProps<AnyInfraction>) {
  const [input, , helper] = useField<AnyInfraction[] | undefined>(name)

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
      const nextInfractions = [...(input.value || []), {}] as AnyInfraction[]

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
        throw new FrontendError('`input.value` is undefined')
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
      throw new FrontendError('`editedIndex` is undefined')
    }

    // If we clicked the cancellation button and the edition form was for a new item, we delete it
    if (isEditedIndexNew) {
      remove(editedIndex)
    }

    closeForm()
  }, [closeForm, editedIndex, isEditedIndexNew, remove])

  const submit = useCallback(
    (updatedInfraction: AnyInfraction) => {
      if (!input.value || editedIndex === undefined) {
        throw new FrontendError('`input.value` or `editedIndex` is undefined')
      }

      // TODO For some unknown reason, `Yup.string().default('')` doesn't fill `comments`.
      const updatedInfractionWithComments: AnyInfraction = {
        ...updatedInfraction,
        comments: updatedInfraction.comments || ''
      }

      const nextInfractions = update(editedIndex, updatedInfractionWithComments, input.value)

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
                <Infraction
                  data={infraction}
                  index={index}
                  onDelete={remove}
                  onEdit={setEditedIndex}
                  seizurePropName={seizurePropName}
                  seizureTagLabel={seizureTagLabel}
                />
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
    margin: 12px 0 8px;
  }
`

const StyledForm = styled(Form)`
  background-color: transparent;
  border: 0;
  padding: 0;

  > .Field,
  > fieldset {
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
  > .rs-picker-toggle {
    /* TODO Investigate both these props which are a hack to fix long NATINFs breaking the layout. */
    max-width: 312px;
  }
`
