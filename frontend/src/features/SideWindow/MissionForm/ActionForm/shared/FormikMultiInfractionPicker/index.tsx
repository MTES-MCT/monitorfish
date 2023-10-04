import { Accent, Button, FormikTextarea, Icon } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { find } from 'lodash'
import { remove as ramdaRemove, update as ramdaUpdate } from 'ramda'
import { Fragment, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Infraction } from './Infraction'
import { InfractionForm } from './InfractionForm'
import { FrontendError } from '../../../../../../libs/FrontendError'
import { FrontendErrorBoundary } from '../../../../../../ui/FrontendErrorBoundary'
import { useGetNatinfsAsOptions } from '../../../hooks/useGetNatinfsAsOptions'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../../shared/FieldsetGroupSeparator'

import type { MissionAction } from '../../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../../types'
import type { FormikTextareaProps } from '@mtes-mct/monitor-ui'
import type { ReactNode } from 'react'

export type FormikMultiInfractionPickerProps = {
  addButtonLabel: string
  children?: ReactNode
  generalObservationTextareaProps?: Omit<FormikTextareaProps, 'name'> & {
    name: keyof MissionActionFormValues
  }
  infractionLabel?: string
  label: string
  name: keyof MissionActionFormValues
}
export function FormikMultiInfractionPicker({
  addButtonLabel,
  children,
  generalObservationTextareaProps,
  infractionLabel,
  label,
  name
}: FormikMultiInfractionPickerProps) {
  const [input, , helper] = useField<MissionAction.OtherInfraction[] | undefined>(name)

  const [editedIndex, setEditedIndex] = useState<number | undefined>(undefined)
  const [isNewInfractionFormOpen, setIsNewInfractionFormOpen] = useState(false)

  const natinfsAsOptions = useGetNatinfsAsOptions()

  const infractionsWithLabel = useMemo(() => {
    if (!input.value) {
      return []
    }

    return input.value.map(infraction => {
      const nextInfractionLabel = find(natinfsAsOptions, { value: infraction.natinf })?.label

      return { ...infraction, infractionLabel: nextInfractionLabel }
    })
  }, [input.value, natinfsAsOptions])

  const closeInfractionForm = useCallback(() => {
    setEditedIndex(undefined)
  }, [])

  const closeNewInfractionForm = useCallback(() => {
    setIsNewInfractionFormOpen(false)
  }, [])

  const create = useCallback(
    (newInfractionFormValues: MissionAction.OtherInfraction) => {
      const newInfractionWithComments: MissionAction.OtherInfraction = {
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
    (nextInfractionFormValues: MissionAction.OtherInfraction) => {
      if (!input.value || editedIndex === undefined) {
        throw new FrontendError('`input.value` or `editedIndex` is undefined')
      }

      const updatedInfractionWithComments: MissionAction.OtherInfraction = {
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

        {infractionsWithLabel.length > 0 && (
          <Row>
            {infractionsWithLabel.map((infraction, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`${name}-infraction-${index}`}>
                <FieldsetGroupSeparator />

                {index !== editedIndex && (
                  <Infraction
                    data={infraction}
                    index={index}
                    label={infractionLabel}
                    onDelete={remove}
                    onEdit={setEditedIndex}
                  />
                )}

                {index === editedIndex && (
                  <InfractionForm
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
              initialValues={{} as MissionAction.OtherInfraction}
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
  }
`

const Row = styled.div`
  > legend {
    margin: 12px 0 8px;
  }
`
