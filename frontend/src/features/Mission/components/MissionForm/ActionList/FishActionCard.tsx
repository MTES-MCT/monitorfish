import { MissionAction } from '@features/Mission/missionAction.types'
import { FrontendError } from '@libs/FrontendError'
import { Accent, Icon, IconButton, Tag, TagGroup, THEME } from '@mtes-mct/monitor-ui'
import { UNKNOWN_VESSEL } from 'domain/entities/vessel/vessel'
import { find } from 'lodash'
import { useMemo } from 'react'
import styled from 'styled-components'

import { ActionLabel, Head, NoteContent } from './styles'
import { getActionTitle, getMissionActionInfractionsFromMissionActionFormValues } from './utils'
import { useGetNatinfsAsOptions } from '../hooks/useGetNatinfsAsOptions'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type FishActionCardProps = Readonly<{
  missionAction: MissionActionFormValues
  onDuplicate: () => Promisable<void>
  onRemove: () => Promisable<void>
}>
export function FishActionCard({ missionAction, onDuplicate, onRemove }: FishActionCardProps) {
  const natinfsAsOptions = useGetNatinfsAsOptions()

  const isControlAction =
    missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
    missionAction.actionType === MissionAction.MissionActionType.LAND_CONTROL ||
    missionAction.actionType === MissionAction.MissionActionType.SEA_CONTROL

  const [actionLabel, ActionIcon] = useMemo(() => {
    const vesselName = missionAction.vesselName === UNKNOWN_VESSEL.vesselName ? 'INCONNU' : missionAction.vesselName

    switch (missionAction.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return [getActionTitle('Contrôle aérien', vesselName, 'Navire inconnu'), Icon.Plane]

      case MissionAction.MissionActionType.AIR_SURVEILLANCE:
        return [
          getActionTitle(
            'Surveillance aérienne',
            missionAction.numberOfVesselsFlownOver
              ? `${missionAction.numberOfVesselsFlownOver} pistes survolées`
              : undefined,
            'à renseigner'
          ),
          Icon.Observation
        ]

      case MissionAction.MissionActionType.LAND_CONTROL:
        return [getActionTitle('Contrôle à la débarque', vesselName, 'Navire inconnu'), Icon.Anchor]

      case MissionAction.MissionActionType.OBSERVATION:
        return [<NoteContent>{missionAction.otherComments ?? 'Note libre à renseigner'}</NoteContent>, Icon.Note]

      case MissionAction.MissionActionType.SEA_CONTROL:
        return [getActionTitle('Contrôle en mer', vesselName, 'Navire inconnu'), Icon.FleetSegment]

      default:
        throw new FrontendError('`initialValues.actionType` does not match the enum')
    }
  }, [missionAction])

  const infractionTags = useMemo(() => {
    const allInfractions = getMissionActionInfractionsFromMissionActionFormValues(missionAction, true)
    if (!allInfractions.length) {
      return []
    }
    const nonPendingInfractions = getMissionActionInfractionsFromMissionActionFormValues(missionAction)
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

      return infractionLabel ?? natinf.toString()
    })
    const infractionsLabel = `${infractionsNatinfs.length} NATINF: ${infractionsNatinfs.join(', ')}`
    const infractionsTag = (
      <Tag key={infractionsLabel} accent={Accent.PRIMARY} title={infractionsTitle.join(', ')}>
        {infractionsLabel}
      </Tag>
    )

    return [...infractionsRecapTags, infractionsTag]
  }, [missionAction, natinfsAsOptions])

  const redTags = useMemo(
    () =>
      [
        ...(missionAction.hasSomeGearsSeized ? ['Appréhension engin'] : []),
        ...(missionAction.hasSomeSpeciesSeized ? ['Appréhension espèce'] : []),
        ...(missionAction.seizureAndDiversion ? ['Appréhension navire'] : [])
      ].map(label => (
        <Tag
          key={label}
          accent={Accent.PRIMARY}
          Icon={Icon.CircleFilled}
          iconColor={THEME.color.maximumRed}
          withCircleIcon
        >
          {label}
        </Tag>
      )),
    [missionAction]
  )

  return (
    <>
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
    </>
  )
}

const RightAlignedIconButton = styled(IconButton)`
  margin-left: auto;
`

const StyledTagGroup = styled(TagGroup)`
  margin-top: 12px;
  padding-left: 32px;
`
