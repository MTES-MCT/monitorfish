import { FormikCheckbox, FormikMultiRadio, FormikTextarea, pluralize } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { getNumberInFrench } from './utils'
import { FieldsetGroup } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

type ControlQualityFieldProps = Readonly<{
  withLastHaul?: boolean
}>

export function ControlQualityField({ withLastHaul = false }: ControlQualityFieldProps) {
  const { values } = useFormikContext<MissionActionFormValues>()

  const priorityGroups = (values.vesselGroups ?? []).filter(group => group.isPriorityGroup)
  const currentTripReportingLength = (values.tripReportings ?? []).length
  const isPriorityTarget = priorityGroups.length > 0 || currentTripReportingLength > 0
  const reportingsText = `${getNumberInFrench(currentTripReportingLength)} ${pluralize('suspicion', currentTripReportingLength)} d’infraction est en cours sur sa marée.`

  return (
    <Wrapper isLight legend="Qualité du contrôle (interne CNSP)">
      {!!values.vesselId && (
        <PriorityTarget data-cy="mission-action-priority-target">
          {isPriorityTarget ? (
            <>
              Le navire est une cible prioritaire :
              {priorityGroups.length === 0 && currentTripReportingLength > 0 && ` ${reportingsText}`}
              {priorityGroups.length > 0 &&
                ` il appartient au${priorityGroups.length > 1 ? 'x' : ''} ${pluralize('groupe', priorityGroups.length)} ${pluralize('prioritaire', priorityGroups.length)} `}
              {priorityGroups.map((group, index, groups) => (
                <span key={group.id}>
                  “{group.name}”{groups.length > index + 1 ? ' et ' : ''}
                </span>
              ))}
              {priorityGroups.length > 0 && currentTripReportingLength === 0 && '.'}
              {priorityGroups.length > 0 && currentTripReportingLength > 0 && <>, et {reportingsText}</>}
            </>
          ) : (
            <strong>Le navire n’est pas considéré comme une cible prioritaire.</strong>
          )}
        </PriorityTarget>
      )}
      {withLastHaul && (
        <FormikMultiRadio
          isErrorMessageHidden
          isInline
          isRequired
          label="Last haul effectué"
          name="isLastHaul"
          options={[
            { label: 'Oui', value: true },
            { label: 'Non', value: false }
          ]}
        />
      )}
      <FormikTextarea
        label="Observations sur le déroulé du contrôle"
        name="controlQualityComments"
        placeholder="Éléments marquants dans vos échanges avec l’unité, problèmes rencontrés..."
        rows={2}
      />
      <FormikCheckbox label="Unité sans jauge oméga" name="unitWithoutOmegaGauge" />
    </Wrapper>
  )
}

const Wrapper = styled(FieldsetGroup)`
  > div {
    > .Element-Fieldset:not(:first-child),
    > .Element-Field {
      margin-top: 16px;
    }
  }
`

const PriorityTarget = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font-style: italic;

  > ul {
    margin: 4px 0 0;
    padding-left: 20px;
  }
`
