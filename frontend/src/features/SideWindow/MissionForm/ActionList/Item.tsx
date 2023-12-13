import {
  Accent,
  FieldError,
  getLocalizedDayjs,
  Icon,
  IconButton,
  Tag,
  TagBullet,
  TagGroup,
  THEME
} from '@mtes-mct/monitor-ui'
import { find } from 'lodash'
import { useMemo } from 'react'
import styled, { css } from 'styled-components'

import { formatDateLabel, getActionTitle, getMissionActionInfractionsFromMissionActionFormValues } from './utils'
import { UNKNOWN_VESSEL } from '../../../../domain/entities/vessel/vessel'
import { MissionAction } from '../../../../domain/types/missionAction'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../../libs/FrontendError'
import { useGetNatinfsAsOptions } from '../hooks/useGetNatinfsAsOptions'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type ItemProps = {
  initialValues: MissionActionFormValues
  isSelected: boolean
  onDuplicate: () => Promisable<void>
  onRemove: () => Promisable<void>
  onSelect: () => Promisable<void>
}
export function Item({ initialValues, isSelected, onDuplicate, onRemove, onSelect }: ItemProps) {
  const draft = useMainAppSelector(state => state.mission.draft)

  const natinfsAsOptions = useGetNatinfsAsOptions()

  const isControlAction =
    initialValues.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
    initialValues.actionType === MissionAction.MissionActionType.LAND_CONTROL ||
    initialValues.actionType === MissionAction.MissionActionType.SEA_CONTROL

  const [actionLabel, ActionIcon] = useMemo(() => {
    const vesselName = initialValues.vesselName === UNKNOWN_VESSEL.vesselName ? 'INCONNU' : initialValues.vesselName

    switch (initialValues.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return [getActionTitle('Contrôle aérien', vesselName, '- Navire inconnu'), Icon.Plane]

      case MissionAction.MissionActionType.AIR_SURVEILLANCE:
        return [
          getActionTitle(
            'Surveillance aérienne',
            initialValues.numberOfVesselsFlownOver
              ? `${initialValues.numberOfVesselsFlownOver} pistes survolées`
              : undefined,
            'à renseigner'
          ),
          Icon.Observation
        ]

      case MissionAction.MissionActionType.LAND_CONTROL:
        return [getActionTitle('Contrôle à la débarque', vesselName, '- Navire inconnu'), Icon.Anchor]

      case MissionAction.MissionActionType.OBSERVATION:
        return [getActionTitle('', initialValues.otherComments, 'Note libre à renseigner'), Icon.Note]

      case MissionAction.MissionActionType.SEA_CONTROL:
        return [getActionTitle('Contrôle en mer', vesselName, '- Navire inconnu'), Icon.FleetSegment]

      default:
        throw new FrontendError('`initialValues.actionType` does not match the enum')
    }
  }, [initialValues])

  const infractionTags = useMemo(() => {
    const allInfractions = getMissionActionInfractionsFromMissionActionFormValues(initialValues, true)
    if (!allInfractions.length) {
      return []
    }
    const nonPendingInfractions = getMissionActionInfractionsFromMissionActionFormValues(initialValues)
    const pendingInfractions = allInfractions.filter(
      ({ infractionType }) => infractionType === MissionAction.InfractionType.PENDING
    )
    const withRecordInfractions = nonPendingInfractions.filter(
      ({ infractionType }) => infractionType === MissionAction.InfractionType.WITH_RECORD
    )
    const infractionsNatinfs = nonPendingInfractions.map(({ natinf }) => natinf)

    const infractionsRecapTags = [
      ...(withRecordInfractions.length > 0 ? [`${withRecordInfractions.length} INF AVEC PV`] : []),
      ...(pendingInfractions.length > 0 ? [`${pendingInfractions.length} INF EN ATTENTE`] : [])
    ].map(label => (
      <Tag key={label} accent={Accent.PRIMARY}>
        {label}
      </Tag>
    ))

    const infractionsTitle = infractionsNatinfs.map(natinf => {
      const infractionLabel = find(natinfsAsOptions, { value: natinf })?.label

      return infractionLabel || natinf.toString()
    })
    const infractionsLabel = `${infractionsNatinfs.length} NATINF: ${infractionsNatinfs.join(', ')}`
    const infractionsTag = (
      <Tag key={infractionsLabel} accent={Accent.PRIMARY} title={infractionsTitle.join(', ')}>
        {infractionsLabel}
      </Tag>
    )

    return [...infractionsRecapTags, infractionsTag]
  }, [initialValues, natinfsAsOptions])

  const redTags = useMemo(
    () =>
      [
        ...(initialValues.hasSomeGearsSeized ? ['Appréhension engin'] : []),
        ...(initialValues.hasSomeSpeciesSeized ? ['Appréhension espèce'] : []),
        ...(initialValues.seizureAndDiversion ? ['Appréhension navire'] : [])
      ].map(label => (
        <Tag key={label} accent={Accent.PRIMARY} bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed}>
          {label}
        </Tag>
      )),
    [initialValues]
  )

  const startDateAsDayjs = useMemo(
    () => initialValues.actionDatetimeUtc && getLocalizedDayjs(initialValues.actionDatetimeUtc),
    [initialValues]
  )

  const isOpen = isControlAction && draft?.mainFormValues && !draft?.mainFormValues.isClosed && !initialValues.closedBy

  return (
    <>
      <Wrapper>
        {startDateAsDayjs && (
          <DateLabel>
            <b>{formatDateLabel(startDateAsDayjs.format('DD MMM'))}</b> à {startDateAsDayjs.format('HH:mm')}
            <br />
            (UTC)
          </DateLabel>
        )}

        <InnerWrapper
          $isOpen={isOpen}
          $isSelected={isSelected}
          $type={initialValues.actionType}
          data-cy="action-list-item"
          onClick={onSelect}
          title={isOpen ? 'Contrôle en cours' : undefined}
        >
          <Head>
            <ActionLabel>
              <ActionIcon color={THEME.color.charcoal} size={20} />
              <p>{actionLabel}</p>
            </ActionLabel>

            <RightAlignedIconButton
              accent={Accent.TERTIARY}
              color={THEME.color.slateGray}
              Icon={Icon.Duplicate}
              iconSize={20}
              onClick={onDuplicate}
              title="Dupliquer l’action"
              withUnpropagatedClick
            />
            <RightAlignedIconButton
              accent={Accent.TERTIARY}
              color={THEME.color.maximumRed}
              Icon={Icon.Delete}
              iconSize={20}
              onClick={onRemove}
              title="Supprimer l’action"
              withUnpropagatedClick
            />
          </Head>

          {isControlAction && redTags.length > 0 && <StyledTagGroup>{redTags}</StyledTagGroup>}
          {isControlAction && infractionTags.length > 0 && <StyledTagGroup>{infractionTags}</StyledTagGroup>}
        </InnerWrapper>
      </Wrapper>

      {!initialValues.isValid && (
        <StyledFieldError>Veuillez compléter les champs manquants dans cette action de contrôle.</StyledFieldError>
      )}
    </>
  )
}

const RightAlignedIconButton = styled(IconButton)`
  margin-left: auto;
`

const Wrapper = styled.div`
  align-items: center;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  font-size: 13px;
  /* This padding allows the top 2px outline to be visible in InnerWrapper */
  padding-top: 2px;
  user-select: none;
`

const DateLabel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 65px;
  padding: 4px 16px 4px 0;
`

const InnerWrapper = styled.div<{
  $isOpen: boolean | undefined
  $isSelected: boolean
  $type: MissionAction.MissionActionType
}>`
  background-color: ${p =>
    ({
      [MissionAction.MissionActionType.AIR_SURVEILLANCE]: p.theme.color.gainsboro,
      [MissionAction.MissionActionType.OBSERVATION]: p.theme.color.blueYonder25
    })[p.$type] || p.theme.color.white};
  border: solid 1px ${p => (p.$isSelected ? p.theme.color.blueGray : p.theme.color.lightGray)};
  outline: ${p => (p.$isSelected ? `${p.theme.color.blueGray} solid 2px` : 'none')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 16px;

  ${p =>
    p.$isOpen &&
    css`
      border-left: solid 5px ${p.theme.color.blueGray};
      padding-left: 12px;
    `}
`

const ActionLabel = styled.div`
  display: flex;
  flex-grow: 1;

  > .Element-IconBox {
    margin-right: 8px;
  }

  > p {
    margin-top: 0px;
    color: ${p => p.theme.color.gunMetal};
    padding: 1px 0px 0 0;
    height: 30px;
  }
`

const Head = styled.div`
  align-items: flex-start;
  display: flex;

  /* TODO Remove the padding if iconSize is set in monitor-ui. */
  > button {
    padding: 0;
  }
`

const StyledTagGroup = styled(TagGroup)`
  margin-top: 8px;
  padding-left: 32px;
`

const StyledFieldError = styled(FieldError)`
  padding-left: 70px;
`
