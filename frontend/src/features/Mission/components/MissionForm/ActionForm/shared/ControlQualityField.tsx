import { FormikCheckbox, FormikMultiRadio, FormikTextarea, pluralize } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

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

  return (
    <Wrapper isLight legend="Qualité du contrôle (interne CNSP)">
      {!!values.vesselId && (
        <PriorityTarget data-cy="mission-action-priority-target">
          {isPriorityTarget ? (
            <>
              <strong>Le navire est une cible prioritaire : il appartient aux groupes prioritaires</strong>
              <ul>
                {priorityGroups
                  .filter(group => !!group.isPriorityGroup)
                  .map((group, index, groups) => (
                    <li key={group.id}>
                      “{group.name}” {groups.length > index + 1 && ' et '}
                    </li>
                  ))}
                {currentTripReportingLength === 0 && '.'}
                {currentTripReportingLength > 0 && (
                  <li>
                    , et {currentTripReportingLength} {pluralize('suspicion', currentTripReportingLength)} d’infraction
                    est en cours sur sa marée.
                  </li>
                )}
              </ul>
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
