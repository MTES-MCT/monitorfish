import {
  Accent,
  getLocalizedDayjs,
  Icon,
  IconButton,
  Tag,
  TagGroup,
  THEME,
  TagBullet,
  FieldError
} from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { formatDateLabel, getMissionActionInfractionsFromMissionActionFormValues, getTitle } from './utils'
import { UNKNOWN_VESSEL } from '../../../../domain/entities/vessel/vessel'
import { MissionAction } from '../../../../domain/types/missionAction'
import { FrontendError } from '../../../../libs/FrontendError'

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
  const [actionLabel, ActionIcon] = useMemo(() => {
    const vesselName = initialValues.vesselName === UNKNOWN_VESSEL.vesselName ? 'INCONNU' : initialValues.vesselName

    switch (initialValues.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return [getTitle('Contrôle aérien', vesselName, '- Navire inconnu'), Icon.Plane]

      case MissionAction.MissionActionType.AIR_SURVEILLANCE:
        return [
          getTitle(
            'Surveillance aérienne',
            initialValues.numberOfVesselsFlownOver
              ? `${initialValues.numberOfVesselsFlownOver} pistes survolées`
              : undefined,
            'à renseigner'
          ),
          Icon.Observation
        ]

      case MissionAction.MissionActionType.LAND_CONTROL:
        return [getTitle('Contrôle à la débarque', vesselName, '- Navire inconnu'), Icon.Anchor]

      case MissionAction.MissionActionType.OBSERVATION:
        return [getTitle('', initialValues.otherComments, 'Note libre à renseigner'), Icon.Note]

      case MissionAction.MissionActionType.SEA_CONTROL:
        return [getTitle('Contrôle en mer', vesselName, '- Navire inconnu'), Icon.FleetSegment]

      default:
        throw new FrontendError('`initialValues.actionType` does not match the enum')
    }
  }, [initialValues])

  const infractionTags = useMemo(() => {
    const infractions = getMissionActionInfractionsFromMissionActionFormValues(initialValues)
    const infractionsWithRecord = infractions.filter(
      ({ infractionType }) => infractionType === MissionAction.InfractionType.WITH_RECORD
    )
    const infractionsNatinfs = infractions.map(({ natinf }) => natinf)

    return [
      ...(infractionsWithRecord.length > 0 ? [`${infractionsWithRecord.length} INF AVEC PV`] : []),
      ...(infractions.length > 0 ? [`${infractions.length} NATINF: ${infractionsNatinfs.join(', ')}`] : [])
    ].map(label => (
      <Tag key={label} accent={Accent.PRIMARY}>
        {label}
      </Tag>
    ))
  }, [initialValues])

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
          data-cy="action-list-item"
          isSelected={isSelected}
          onClick={onSelect}
          type={initialValues.actionType}
        >
          <Head>
            <ActionLabel>
              <ActionIcon color={THEME.color.charcoal} size={20} />
              <p>{actionLabel}</p>
            </ActionLabel>

            <IconButton
              accent={Accent.TERTIARY}
              color={THEME.color.slateGray}
              Icon={Icon.Duplicate}
              iconSize={20}
              onClick={onDuplicate}
              title="Dupliquer l’action"
              withUnpropagatedClick
            />
            <IconButton
              accent={Accent.TERTIARY}
              color={THEME.color.maximumRed}
              Icon={Icon.Delete}
              iconSize={20}
              onClick={onRemove}
              title="Supprimer l’action"
              withUnpropagatedClick
            />
          </Head>

          {redTags.length > 0 && <StyledTagGroup>{redTags}</StyledTagGroup>}
          {infractionTags.length > 0 && <StyledTagGroup>{infractionTags}</StyledTagGroup>}
        </InnerWrapper>
      </Wrapper>

      {!initialValues.isValid && (
        <StyledFieldError>Veuillez compléter les champs manquants dans cette action de contrôle.</StyledFieldError>
      )}
    </>
  )
}

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
  min-width: 70px;
  padding: 4px 24px 4px 0;
`

const InnerWrapper = styled.div<{
  isSelected: boolean
  type: MissionAction.MissionActionType
}>`
  background-color: ${p =>
    ({
      [MissionAction.MissionActionType.AIR_SURVEILLANCE]: p.theme.color.gainsboro,
      [MissionAction.MissionActionType.OBSERVATION]: p.theme.color.blueYonder[25]
    }[p.type] || p.theme.color.white)};
  border: solid 1px ${p => (p.isSelected ? p.theme.color.blueGray['100'] : p.theme.color.lightGray)};
  outline: ${p => (p.isSelected ? `${p.theme.color.blueGray['100']} solid 2px` : 'none')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 16px;
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
    padding: 1px 8px 0 0;
    height: 22px;
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
