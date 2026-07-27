import { FormikCheckbox, FormikMultiRadio, FormikTextarea } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { getPriorityTargetReasons } from './utils'
import { FieldsetGroup } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

type ControlQualityFieldProps = Readonly<{
  withLastHaul?: boolean
}>

function joinReasons(reasons: string[]): string {
  if (reasons.length <= 1) {
    return reasons[0] ?? ''
  }

  return `${reasons.slice(0, -1).join(', ')}, et ${reasons[reasons.length - 1]}`
}

export function ControlQualityField({ withLastHaul = false }: ControlQualityFieldProps) {
  const { values } = useFormikContext<MissionActionFormValues>()

  const { hasGroupOrReportingReason, isPriorityTarget, reasons } = getPriorityTargetReasons(values)

  return (
    <Wrapper isLight legend="Qualité du contrôle (interne CNSP)">
      {!!values.vesselId && (
        <PriorityTarget data-cy="mission-action-priority-target">
          {isPriorityTarget ? (
            <>
              Le navire est une cible prioritaire {hasGroupOrReportingReason ? ': ' : 'car '}
              {joinReasons(reasons)}.
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
  color: ${p => p.theme.color.slateGray};
  font-style: italic;

  > ul {
    margin: 4px 0 0;
    padding-left: 20px;
  }
`
