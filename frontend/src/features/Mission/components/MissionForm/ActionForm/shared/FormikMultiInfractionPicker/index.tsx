import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { FrontendError } from '@libs/FrontendError'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { Fragment, useCallback, useState } from 'react'
import styled from 'styled-components'

import { Infraction } from './Infraction'
import { InfractionForm } from './InfractionForm'
import { FieldsetGroup } from '../../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../../shared/FieldsetGroupSeparator'

import type { MissionActionFormValues } from '../../../types'
import type { MissionAction } from '@features/Mission/missionAction.types'

type FormikMultiInfractionPickerProps = Readonly<{
  addButtonLabel: string
  label: string
}>
export function FormikMultiInfractionPicker({ addButtonLabel, label }: FormikMultiInfractionPickerProps) {
  const { errors, setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const [editedInfractionIndex, setEditedInfractionIndex] = useState<number | undefined>(undefined)
  const [isNewInfractionFormOpen, setIsNewInfractionFormOpen] = useState(false)

  const infractions = values.infractions ?? []

  const closeInfractionForm = useCallback(() => {
    setEditedInfractionIndex(undefined)
  }, [])

  const closeNewInfractionForm = useCallback(() => {
    setIsNewInfractionFormOpen(false)
  }, [])

  const create = useCallback(
    (newInfractionFormValues: MissionAction.Infraction) => {
      const newInfractionWithComments: MissionAction.Infraction = {
        ...newInfractionFormValues,
        comments: newInfractionFormValues.comments || ''
      }

      const nextInfractions = [...(values.infractions ?? []), newInfractionWithComments]

      setFieldValue('infractions', nextInfractions)

      setIsNewInfractionFormOpen(false)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.infractions]
  )

  const remove = useCallback(
    (index: number) => {
      const previousInfractions = values.infractions ?? []
      const nextInfractions = [...previousInfractions.slice(0, index), ...previousInfractions.slice(index + 1)]
      const normalizedNextInfractions = nextInfractions.length > 0 ? nextInfractions : undefined

      setFieldValue('infractions', normalizedNextInfractions)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.infractions]
  )

  const openNewInfractionForm = useCallback(() => {
    setIsNewInfractionFormOpen(true)
  }, [])

  const onEdit = useCallback((index: number) => {
    setEditedInfractionIndex(index)
  }, [])

  const update = useCallback(
    (nextInfractionFormValues: MissionAction.Infraction) => {
      if (editedInfractionIndex === undefined) {
        throw new FrontendError('`editedInfraction` is undefined')
      }

      const updatedInfractionWithComments: MissionAction.Infraction = {
        ...nextInfractionFormValues,
        comments: nextInfractionFormValues.comments || ''
      }

      const previousInfractions = values.infractions ?? []
      const nextInfractions = previousInfractions.map((infraction, index) =>
        index === editedInfractionIndex ? updatedInfractionWithComments : infraction
      )

      setFieldValue('infractions', nextInfractions)

      closeInfractionForm()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeInfractionForm, editedInfractionIndex, values.infractions]
  )

  const infractionsErrorsIds =
    (errors.infractions as unknown as Array<Record<number, any> | undefined> | undefined)?.reduce(
      (acc: number[], value, index) => {
        if (value !== undefined) {
          acc.push(index)
        }

        return acc
      },
      []
    ) ?? []

  return (
    <Wrapper isLight legend={label}>
      <FrontendErrorBoundary>
        {infractions.length > 0 && (
          <StyledRow>
            {infractions.map((infraction, index) => {
              const isEdition = index === editedInfractionIndex

              return (
                <Fragment
                  // eslint-disable-next-line react/no-array-index-key
                  key={`infraction-${index}`}
                >
                  {!isEdition && (
                    <>
                      <Infraction
                        data={infraction}
                        hasError={infractionsErrorsIds.includes(index)}
                        hasMultipleInfraction={infractions.length > 1}
                        index={index}
                        onDelete={remove}
                        onEdit={onEdit}
                      />
                      {index + 1 < infractions.length && <StyledFieldsetGroupSeparator marginBottom={0} />}
                    </>
                  )}

                  {isEdition && (
                    <>
                      <InfractionForm initialValues={infraction} onCancel={closeInfractionForm} onSubmit={update} />
                      {infractions.length > index + 1 && <StyledFieldsetGroupSeparator marginBottom={0} />}
                    </>
                  )}
                </Fragment>
              )
            })}
          </StyledRow>
        )}
        {!isNewInfractionFormOpen && (
          <>
            {infractions.length > 0 && <StyledFieldsetGroupSeparator />}
            <Button accent={Accent.SECONDARY} Icon={Icon.Plus} isFullWidth onClick={openNewInfractionForm}>
              {addButtonLabel}
            </Button>
          </>
        )}

        {isNewInfractionFormOpen && (
          <>
            {infractions.length > 0 && <StyledFieldsetGroupSeparator marginBottom={0} />}
            <Row>
              <InfractionForm
                initialValues={{} as MissionAction.Infraction}
                onCancel={closeNewInfractionForm}
                onSubmit={create}
              />
            </Row>
          </>
        )}
      </FrontendErrorBoundary>
    </Wrapper>
  )
}

const Wrapper = styled(FieldsetGroup)`
  > div {
    padding: 0;

    > .Element-Field:not(:first-child),
    > .Element-Fieldset:not(:first-child) {
      margin-top: 16px;
    }
  }
`

const StyledFieldsetGroupSeparator = styled(FieldsetGroupSeparator)`
  margin-top: 0;
`

const Row = styled.div``

const StyledRow = styled(Row)`
  padding-top: 0;
`
