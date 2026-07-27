import { EU_COUNTRY_CODES } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { FormikCheckbox, FormikMultiRadio, FormikTextarea, pluralize } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { Fragment } from 'react'
import styled from 'styled-components'

import { getNumberInFrench } from './utils'
import { FieldsetGroup } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'
import type { ReactNode } from 'react'

type ControlQualityFieldProps = Readonly<{
  withLastHaul?: boolean
}>

function joinReasons(reasons: ReactNode[]): ReactNode {
  return reasons.map((reason, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <Fragment key={index}>
      {index > 0 && (index === reasons.length - 1 ? ', et ' : ', ')}
      {reason}
    </Fragment>
  ))
}

export function ControlQualityField({ withLastHaul = false }: ControlQualityFieldProps) {
  const { values } = useFormikContext<MissionActionFormValues>()

  const priorityGroups = (values.vesselGroups ?? []).filter(group => group.isPriorityGroup)
  const currentTripReportingLength = (values.tripReportings ?? []).length
  const hasGroupOrReportingReason = priorityGroups.length > 0 || currentTripReportingLength > 0
  const isThirdCountryVesselLandingInFrance =
    values.actionType === MissionAction.MissionActionType.LAND_CONTROL &&
    !!values.portLocode?.startsWith('FR') &&
    !!values.flagState &&
    values.flagState !== 'UNDEFINED' &&
    !EU_COUNTRY_CODES.includes(values.flagState)
  const isPriorityTarget =
    priorityGroups.length > 0 ||
    currentTripReportingLength > 0 ||
    !!values.isINNControl ||
    isThirdCountryVesselLandingInFrance

  const reasons: ReactNode[] = []
  if (priorityGroups.length > 0) {
    reasons.push(
      <>
        il appartient au{priorityGroups.length > 1 ? 'x' : ''} {pluralize('groupe', priorityGroups.length)}{' '}
        {pluralize('prioritaire', priorityGroups.length)}{' '}
        {priorityGroups.map((group, index, groups) => (
          <span key={group.id}>
            “{group.name}”{groups.length > index + 1 ? ' et ' : ''}
          </span>
        ))}
      </>
    )
  }
  if (currentTripReportingLength > 0) {
    reasons.push(
      `${getNumberInFrench(currentTripReportingLength)} ${pluralize('suspicion', currentTripReportingLength)} d’infraction est en cours sur sa marée`
    )
  }
  if (values.isINNControl) {
    reasons.push('c’est un navire INN')
  }
  if (isThirdCountryVesselLandingInFrance) {
    reasons.push('c’est un navire tiers débarquant dans un port français')
  }

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
