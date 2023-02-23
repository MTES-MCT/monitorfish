import {
  Accent,
  getLocalizedDayjs,
  Icon,
  IconButton,
  Size,
  Tag,
  TagGroup,
  THEME,
  TagBullet
} from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { formatDateLabel, getMissionActionInfractionsFromMissionActionFromFormValues } from './utils'
import { MissionAction } from '../../../../domain/types/missionAction'
import { FrontendError } from '../../../../libs/FrontendError'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type ItemProps = {
  initialValues: MissionActionFormValues
  isSelected: boolean
  onDelete: () => Promisable<void>
  onDuplicate: () => Promisable<void>
  onEdit: () => Promisable<void>
}
export function Item({ initialValues, isSelected, onDelete, onDuplicate, onEdit }: ItemProps) {
  const [actionLabel, ActionIcon] = useMemo(() => {
    switch (initialValues.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return [
          initialValues.vesselName ? `Contrôle aérien - ${initialValues.vesselName}` : 'Contrôle aérien à renseigner',
          Icon.FleetSegment
        ]

      case MissionAction.MissionActionType.AIR_SURVEILLANCE:
        return [
          initialValues.numberOfVesselsFlownOver
            ? `Surveillance aérienne - ${initialValues.numberOfVesselsFlownOver} pistes survolées`
            : 'Surveillance aérienne à renseigner',
          Icon.Observation
        ]

      case MissionAction.MissionActionType.LAND_CONTROL:
        return [
          initialValues.vesselName
            ? `Contrôle à la débarque - ${initialValues.vesselName}`
            : 'Contrôle à la débarque à renseigner',
          Icon.Anchor
        ]

      case MissionAction.MissionActionType.OBSERVATION:
        return [initialValues.otherComments ? initialValues.otherComments : 'Note libre à renseigner', Icon.Note]

      case MissionAction.MissionActionType.SEA_CONTROL:
        return [
          initialValues.vesselName ? `Contrôle en mer - ${initialValues.vesselName}` : 'Contrôle en mer à renseigner',
          Icon.FleetSegment
        ]

      default:
        throw new FrontendError('`initialValues.actionType` does not match the enum. This should never happen.')
    }
  }, [initialValues])

  const infractionTags = useMemo(() => {
    const infractions = getMissionActionInfractionsFromMissionActionFromFormValues(initialValues)
    const infractionsWithRecord = infractions.filter(
      ({ infractionType }) => infractionType === MissionAction.InfractionType.WITH_RECORD
    )

    return [
      ...(infractionsWithRecord.length > 0 ? [`${infractionsWithRecord.length} INF AVEC PV`] : []),
      ...infractions.map(({ natinf }) => `NATINF : ${natinf}`)
    ].map(label => (
      <Tag key={label} accent={Accent.PRIMARY}>
        {label}
      </Tag>
    ))
  }, [initialValues])

  const redTags = useMemo(() => {
    const gearInfractionsWithGearSeized = (initialValues.gearInfractions || []).filter(({ gearSeized }) => gearSeized)

    return [...(gearInfractionsWithGearSeized.length > 0 ? ['Appréhension engin'] : [])].map(label => (
      <Tag accent={Accent.PRIMARY} bullet={TagBullet.DISK} bulletColor={THEME.color.maximumRed}>
        {label}
      </Tag>
    ))
  }, [initialValues])

  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(initialValues.actionDatetimeUtc), [initialValues])

  return (
    <Wrapper>
      <DateLabel>
        <b>{formatDateLabel(startDateAsDayjs.format('DD MMM'))}</b> à {startDateAsDayjs.format('HH:mm')}
      </DateLabel>

      {/* TODO How do we edit an action in terms of UX? */}
      <InnerWrapper isSelected={isSelected} onClick={onEdit}>
        <Head>
          <ActionLabel>
            <ActionIcon color={THEME.color.charcoal} size={20} />
            <p>{actionLabel}</p>
          </ActionLabel>

          <IconButton
            accent={Accent.TERTIARY}
            color={THEME.color.slateGray}
            Icon={Icon.Duplicate}
            onClick={onDuplicate}
            size={Size.NORMAL}
          />
          <IconButton
            accent={Accent.TERTIARY}
            color={THEME.color.maximumRed}
            Icon={Icon.Delete}
            onClick={onDelete}
            size={Size.NORMAL}
          />
        </Head>

        <StyledTagGroup>{infractionTags}</StyledTagGroup>
        <StyledTagGroup>{redTags}</StyledTagGroup>
      </InnerWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  font-size: 13px;
  /* This padding allows the top 2px outline to be visible in InnerWrapper */
  padding-top: 2px;
`

const DateLabel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 80px;
  padding: 4px 24px 4px 0;
  text-align: center;
`

const InnerWrapper = styled.div<{
  isSelected: boolean
}>`
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
  padding: 4px;

  /* The SVG icon is wrapper in a div */
  > div {
    margin-right: 8px;
  }

  > p {
    padding-top: 1px;
  }
`

const Head = styled.div`
  align-items: flex-start;
  display: flex;
  padding-bottom: 4px;
`

const StyledTagGroup = styled(TagGroup)`
  margin-top: 8px;
  padding-left: 32px;
`
