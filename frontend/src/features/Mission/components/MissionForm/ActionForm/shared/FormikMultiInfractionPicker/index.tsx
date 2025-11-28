import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { FrontendError } from '@libs/FrontendError'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { find } from 'lodash-es'
import { Fragment, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Infraction } from './Infraction'
import { InfractionForm } from './InfractionForm'
import { useGetNatinfsAsOptions } from '../../../hooks/useGetNatinfsAsOptions'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../../shared/FieldsetGroupSeparator'

import type { MissionActionFormValues } from '../../../types'
import type { MissionAction } from '@features/Mission/missionAction.types'

type FormikMultiInfractionPickerProps = Readonly<{
  addButtonLabel: string
  label: string
}>
export function FormikMultiInfractionPicker({ addButtonLabel, label }: FormikMultiInfractionPickerProps) {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const [editedInfractionIndex, setEditedInfractionIndex] = useState<number | undefined>(undefined)
  const [isNewInfractionFormOpen, setIsNewInfractionFormOpen] = useState(false)

  const natinfsAsOptions = useGetNatinfsAsOptions()

  const infractionsWithLabelAndIndex = useMemo(() => {
    const allInfractions =
      values.infractions?.map((infraction, index) => ({
        ...infraction,
        index
      })) ?? []
    if (!allInfractions.length) {
      return []
    }

    return allInfractions.map(infraction => {
      const nextInfractionLabel = find(natinfsAsOptions, { value: infraction.natinf })?.label

      return { ...infraction, label: nextInfractionLabel }
    })
  }, [values.infractions, natinfsAsOptions])

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
      const infractions = values.infractions ?? []
      const nextInfractions = [...infractions.slice(0, index), ...infractions.slice(index + 1)]
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

      const infractions = values.infractions ?? []
      const nextInfractions = infractions.map((infraction, index) =>
        index === editedInfractionIndex ? updatedInfractionWithComments : infraction
      )

      setFieldValue('infractions', nextInfractions)

      closeInfractionForm()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeInfractionForm, editedInfractionIndex, values.infractions]
  )

  if (!natinfsAsOptions.length) {
    return <FieldsetGroupSpinner isLight legend={label} />
  }

  return (
    <Wrapper isLight legend={label}>
      <FrontendErrorBoundary>
        {infractionsWithLabelAndIndex.length > 0 && (
          <StyledRow>
            {infractionsWithLabelAndIndex.map((infraction, index) => {
              const isEdition = infraction.index === editedInfractionIndex

              return (
                <Fragment key={`infraction-${infraction.index}`}>
                  {!isEdition && (
                    <>
                      <Infraction data={infraction} index={infraction.index} onDelete={remove} onEdit={onEdit} />
                      {index + 1 < infractionsWithLabelAndIndex.length && <FieldsetGroupSeparator marginBottom={12} />}
                    </>
                  )}

                  {isEdition && (
                    <>
                      <InfractionForm
                        initialValues={infraction}
                        natinfsAsOptions={natinfsAsOptions}
                        onCancel={closeInfractionForm}
                        onSubmit={update}
                      />
                      {infractionsWithLabelAndIndex.length > index + 1 && <FieldsetGroupSeparator marginBottom={12} />}
                    </>
                  )}
                </Fragment>
              )
            })}
          </StyledRow>
        )}
        {!isNewInfractionFormOpen && (
          <>
            {infractionsWithLabelAndIndex.length > 0 && <FieldsetGroupSeparator />}
            <Button accent={Accent.SECONDARY} Icon={Icon.Plus} isFullWidth onClick={openNewInfractionForm}>
              {addButtonLabel}
            </Button>
          </>
        )}

        {isNewInfractionFormOpen && (
          <>
            {infractionsWithLabelAndIndex.length > 0 && <FieldsetGroupSeparator marginBottom={12} />}
            <Row>
              <InfractionForm
                initialValues={{} as MissionAction.Infraction}
                natinfsAsOptions={natinfsAsOptions}
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
    > .Element-Field:not(:first-child),
    > .Element-Fieldset:not(:first-child) {
      margin-top: 16px;
    }
  }
`

const Row = styled.div`
  > legend {
    margin: 12px 0 8px;

    &:first-child {
      margin: 0 0 8px;
    }
  }
`

const StyledRow = styled(Row)`
  padding-top: 0;
`
