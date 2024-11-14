import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { FrontendError } from '@libs/FrontendError'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { find } from 'lodash'
import { remove as ramdaRemove, update as ramdaUpdate } from 'ramda'
import { Fragment, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Infraction } from './Infraction'
import { InfractionForm } from './InfractionForm'
import { InfractionCategory } from './types'
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

  const [editedInfraction, setEditedInfraction] = useState<{ index: number; infractionGroup: string } | undefined>(
    undefined
  )
  const [isNewInfractionFormOpen, setIsNewInfractionFormOpen] = useState(false)

  const natinfsAsOptions = useGetNatinfsAsOptions()

  const infractionsWithLabelGroupAndIndex = useMemo(() => {
    const allInfractions = [
      ...(values.gearInfractions?.map((infraction, index) => ({
        ...infraction,
        group: InfractionCategory.GEAR_INFRACTIONS,
        index
      })) ?? []),
      ...(values.logbookInfractions?.map((infraction, index) => ({
        ...infraction,
        group: InfractionCategory.LOGBOOK_INFRACTION,
        index
      })) ?? []),
      ...(values.otherInfractions?.map((infraction, index) => ({
        ...infraction,
        group: InfractionCategory.OTHER_INFRACTIONS,
        index
      })) ?? []),
      ...(values.speciesInfractions?.map((infraction, index) => ({
        ...infraction,
        group: InfractionCategory.SPECIES_INFRACTIONS,
        index
      })) ?? [])
    ]
    if (!allInfractions.length) {
      return []
    }

    return allInfractions.map(infraction => {
      const nextInfractionLabel = find(natinfsAsOptions, { value: infraction.natinf })?.label

      return { ...infraction, label: nextInfractionLabel }
    })
  }, [
    values.gearInfractions,
    values.logbookInfractions,
    values.otherInfractions,
    values.speciesInfractions,
    natinfsAsOptions
  ])

  const closeInfractionForm = useCallback(() => {
    setEditedInfraction(undefined)
  }, [])

  const closeNewInfractionForm = useCallback(() => {
    setIsNewInfractionFormOpen(false)
  }, [])

  const create = useCallback(
    (newInfractionFormValues: MissionAction.Infraction, infractionGroup: string | undefined) => {
      if (!infractionGroup) {
        return
      }

      const newInfractionWithComments: MissionAction.Infraction = {
        ...newInfractionFormValues,
        comments: newInfractionFormValues.comments || ''
      }

      const nextInfractions = [...(values[infractionGroup] || []), newInfractionWithComments]

      setFieldValue(infractionGroup, nextInfractions)

      setIsNewInfractionFormOpen(false)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.gearInfractions, values.logbookInfractions, values.otherInfractions, values.speciesInfractions]
  )

  const remove = useCallback(
    (index: number, infractionGroup: string) => {
      if (!values[infractionGroup]) {
        throw new FrontendError('`values[infractionGroup]` is undefined')
      }

      const nextInfractions = ramdaRemove(index, 1, values[infractionGroup])
      const normalizedNextInfractions = nextInfractions.length > 0 ? nextInfractions : undefined

      setFieldValue(infractionGroup, normalizedNextInfractions)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.gearInfractions, values.logbookInfractions, values.otherInfractions, values.speciesInfractions]
  )

  const openNewInfractionForm = useCallback(() => {
    setIsNewInfractionFormOpen(true)
  }, [])

  const onEdit = useCallback((index: number, infractionGroup: string) => {
    setEditedInfraction({ index, infractionGroup })
  }, [])

  const update = useCallback(
    (nextInfractionFormValues: MissionAction.Infraction) => {
      if (editedInfraction === undefined || !values[editedInfraction.infractionGroup]) {
        throw new FrontendError('`editedInfraction` or `values[editedInfraction.infractionGroup]` is undefined')
      }

      const updatedInfractionWithComments: MissionAction.Infraction = {
        ...nextInfractionFormValues,
        comments: nextInfractionFormValues.comments || ''
      }

      const nextInfractions = ramdaUpdate(
        editedInfraction.index,
        updatedInfractionWithComments,
        values[editedInfraction.infractionGroup]
      )

      setFieldValue(editedInfraction.infractionGroup, nextInfractions)

      closeInfractionForm()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      closeInfractionForm,
      editedInfraction,
      values.gearInfractions,
      values.logbookInfractions,
      values.otherInfractions,
      values.speciesInfractions
    ]
  )

  if (!natinfsAsOptions.length) {
    return <FieldsetGroupSpinner isLight legend={label} />
  }

  return (
    <Wrapper isLight legend={label}>
      <FrontendErrorBoundary>
        {infractionsWithLabelGroupAndIndex.length > 0 && (
          <StyledRow>
            {infractionsWithLabelGroupAndIndex.map((infraction, index) => {
              const isEdition =
                infraction.index === editedInfraction?.index && infraction.group === editedInfraction?.infractionGroup

              return (
                <Fragment key={`${infraction.group}-infraction-${infraction.index}`}>
                  {!isEdition && (
                    <>
                      <Infraction data={infraction} index={infraction.index} onDelete={remove} onEdit={onEdit} />
                      {index + 1 < infractionsWithLabelGroupAndIndex.length && (
                        <FieldsetGroupSeparator marginBottom={12} />
                      )}
                    </>
                  )}

                  {isEdition && (
                    <>
                      <InfractionForm
                        initialValues={infraction}
                        isEdition
                        natinfsAsOptions={natinfsAsOptions}
                        onCancel={closeInfractionForm}
                        onSubmit={update}
                      />
                      {infractionsWithLabelGroupAndIndex.length > index + 1 && (
                        <FieldsetGroupSeparator marginBottom={12} />
                      )}
                    </>
                  )}
                </Fragment>
              )
            })}
          </StyledRow>
        )}
        {!isNewInfractionFormOpen && (
          <>
            {infractionsWithLabelGroupAndIndex.length > 0 && <FieldsetGroupSeparator />}
            <Button accent={Accent.SECONDARY} Icon={Icon.Plus} isFullWidth onClick={openNewInfractionForm}>
              {addButtonLabel}
            </Button>
          </>
        )}

        {isNewInfractionFormOpen && (
          <>
            {infractionsWithLabelGroupAndIndex.length > 0 && <FieldsetGroupSeparator marginBottom={12} />}
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
      margin: 0px 0 8px;
    }
  }
`

const StyledRow = styled(Row)`
  padding-top: 0px;
`
