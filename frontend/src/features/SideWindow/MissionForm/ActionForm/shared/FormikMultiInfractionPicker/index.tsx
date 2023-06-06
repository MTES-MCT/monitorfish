import { Accent, Button, FormikTextarea, Icon } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove as ramdaRemove, update as ramdaUpdate } from 'ramda'
import { Fragment, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Infraction } from './Infraction'
import { InfractionForm } from './InfractionForm'
import { useGetInfractionsQuery } from '../../../../../../api/infraction'
import { FrontendError } from '../../../../../../libs/FrontendError'
import { FrontendErrorBoundary } from '../../../../../../ui/FrontendErrorBoundary'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../../shared/FieldsetGroupSeparator'

import type { MissionAction } from '../../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../../types'
import type { Option, FormikCheckboxProps, FormikTextareaProps } from '@mtes-mct/monitor-ui'
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

  const [editedIndex, setEditedIndex] = useState<number | undefined>(undefined)
  const [isNewInfractionFormOpen, setIsNewInfractionFormOpen] = useState(false)

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

  const closeInfractionForm = useCallback(() => {
    setEditedIndex(undefined)
  }, [])

  const closeNewInfractionForm = useCallback(() => {
    setIsNewInfractionFormOpen(false)
  }, [])

  const create = useCallback(
    (newInfractionFormValues: AnyInfraction) => {
      // TODO For some unknown reason, `Yup.string().default('')` doesn't fill `comments`.
      const newInfractionWithComments: AnyInfraction = {
        ...newInfractionFormValues,
        comments: newInfractionFormValues.comments || ''
      }

      const nextInfractions = [...(input.value || []), newInfractionWithComments]

      helper.setValue(nextInfractions)

      setIsNewInfractionFormOpen(false)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

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

  const openNewInfractionForm = useCallback(() => {
    setIsNewInfractionFormOpen(true)
  }, [])

  const update = useCallback(
    (nextInfractionFormValues: AnyInfraction) => {
      if (!input.value || editedIndex === undefined) {
        throw new FrontendError('`input.value` or `editedIndex` is undefined')
      }

      // TODO For some unknown reason, `Yup.string().default('')` doesn't fill `comments`.
      const updatedInfractionWithComments: AnyInfraction = {
        ...nextInfractionFormValues,
        comments: nextInfractionFormValues.comments || ''
      }

      const nextInfractions = ramdaUpdate(editedIndex, updatedInfractionWithComments, input.value)

      helper.setValue(nextInfractions)

      closeInfractionForm()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeInfractionForm, editedIndex, input.value]
  )

  if (!natinfsAsOptions.length) {
    return <FieldsetGroupSpinner isLight legend={label} />
  }

  return (
    <Wrapper isLight legend={label}>
      <FrontendErrorBoundary>
        {children}

        <Button
          accent={Accent.SECONDARY}
          disabled={isNewInfractionFormOpen}
          Icon={Icon.Plus}
          isFullWidth
          onClick={openNewInfractionForm}
        >
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
                  <InfractionForm
                    infractionCheckboxProps={infractionCheckboxProps}
                    initialValues={infraction}
                    natinfsAsOptions={natinfsAsOptions}
                    onCancel={closeInfractionForm}
                    onSubmit={update}
                  />
                )}
              </Fragment>
            ))}
          </Row>
        )}

        {isNewInfractionFormOpen && (
          <Row>
            <InfractionForm
              infractionCheckboxProps={infractionCheckboxProps}
              initialValues={{} as AnyInfraction}
              natinfsAsOptions={natinfsAsOptions}
              onCancel={closeNewInfractionForm}
              onSubmit={create}
            />
          </Row>
        )}

        {generalObservationTextareaProps && (
          <>
            <FieldsetGroupSeparator />

            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <FormikTextarea rows={2} {...generalObservationTextareaProps} />
          </>
        )}
      </FrontendErrorBoundary>
    </Wrapper>
  )
}

const Wrapper = styled(FieldsetGroup)`
  > div {
    > .Element-Field:not(:first-child),
    > .Element-Fieldset:not(:first-child) {
      margin-top: 16px;
    }

    > .Field-Select {
      margin-bottom: 8px;
    }
  }
`

const Row = styled.div`
  > legend {
    margin: 12px 0 8px;
  }
`
