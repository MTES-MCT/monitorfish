import { ConfirmationModal } from '@components/ConfirmationModal'
import { MissionAction } from '@features/Mission/missionAction.types'
import { UNKNOWN_VESSEL } from '@features/Vessel/types/vessel'
import { FrontendError } from '@libs/FrontendError'
import { Accent, Icon, IconButton, Tag, TagGroup, THEME, useNewWindow } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { ActionLabel, Head, NoteContent } from './styles'
import { getActionTitle, getMissionActionInfractionsFromMissionActionFormValues } from './utils'
import { getInfractionTitle } from '../../../../../domain/entities/controls'
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
  const [isDeletionConfirmationModalOpen, setIsDeletionConfirmationModalOpen] = useState(false)
  const { newWindowContainerRef } = useNewWindow()

  const isControlAction =
    missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
    missionAction.actionType === MissionAction.MissionActionType.LAND_CONTROL ||
    missionAction.actionType === MissionAction.MissionActionType.SEA_CONTROL

  const [actionLabel, ActionIcon] = useMemo(() => {
    const vesselName =
      missionAction.vesselName === UNKNOWN_VESSEL.vesselName ? 'Navire inconnu' : missionAction.vesselName
    const flagState = missionAction.flagState === UNKNOWN_VESSEL.flagState ? undefined : missionAction.flagState
    const isUnknown = missionAction.vesselId === UNKNOWN_VESSEL.vesselId

    switch (missionAction.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return [getActionTitle('Contrôle aérien', flagState, isUnknown, vesselName, 'Navire inconnu'), Icon.Plane]

      case MissionAction.MissionActionType.AIR_SURVEILLANCE:
        return [
          getActionTitle(
            'Surveillance aérienne',
            undefined,
            undefined,
            missionAction.numberOfVesselsFlownOver
              ? `${missionAction.numberOfVesselsFlownOver} pistes survolées`
              : undefined,
            'à renseigner'
          ),
          Icon.Observation
        ]

      case MissionAction.MissionActionType.LAND_CONTROL:
        return [
          getActionTitle('Contrôle à la débarque', flagState, isUnknown, vesselName, 'Navire inconnu'),
          Icon.Anchor
        ]

      case MissionAction.MissionActionType.OBSERVATION:
        return [<NoteContent>{missionAction.otherComments ?? 'Note libre à renseigner'}</NoteContent>, Icon.Note]

      case MissionAction.MissionActionType.SEA_CONTROL:
        return [
          getActionTitle('Contrôle en mer', flagState, isUnknown, vesselName, 'Navire inconnu'),
          Icon.FleetSegment
        ]

      default:
        throw new FrontendError('`initialValues.actionType` does not match the enum')
    }
  }, [missionAction])

  const infractionTags = useMemo(() => {
    const allInfractions = getMissionActionInfractionsFromMissionActionFormValues(natinfsAsOptions, missionAction, true)
    if (!allInfractions.length) {
      return []
    }
    const nonPendingInfractions = getMissionActionInfractionsFromMissionActionFormValues(
      natinfsAsOptions,
      missionAction
    )
    const pendingInfractions = allInfractions.filter(
      ({ infractionType }) => infractionType === MissionAction.InfractionType.PENDING
    )
    const withRecordInfractions = nonPendingInfractions.filter(
      ({ infractionType }) => infractionType === MissionAction.InfractionType.WITH_RECORD
    )

    const infractionsRecapTags = [
      ...(withRecordInfractions.length > 0 ? [`${withRecordInfractions.length} INF AVEC PV`] : []),
      ...(pendingInfractions.length > 0 ? [`${pendingInfractions.length} INF EN ATTENTE`] : [])
    ].map(label => (
      <Tag key={label} accent={Accent.PRIMARY}>
        {label}
      </Tag>
    ))

    const infractionsTags = nonPendingInfractions.map(infraction => (
      <StyledTag
        key={getInfractionTitle(infraction as MissionAction.Infraction)}
        accent={Accent.PRIMARY}
        title={getInfractionTitle(infraction as MissionAction.Infraction)}
      >
        {infraction.threatCharacterization} / NATINF {infraction.natinf}
      </StyledTag>
    ))

    return [...infractionsRecapTags, ...infractionsTags]
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

  const confirmDeletion = () => {
    setIsDeletionConfirmationModalOpen(false)
    onRemove()
  }

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
          onClick={() => setIsDeletionConfirmationModalOpen(true)}
          title="Supprimer l’action"
          withUnpropagatedClick
        />
      </Head>

      {isControlAction && redTags.length > 0 && <StyledTagGroup>{redTags}</StyledTagGroup>}
      {isControlAction && infractionTags.length > 0 && <StyledTagGroup>{infractionTags}</StyledTagGroup>}
      {isDeletionConfirmationModalOpen &&
        createPortal(
          <ConfirmationModal
            color={THEME.color.maximumRed}
            confirmationButtonLabel="Supprimer"
            iconName="Delete"
            message="Êtes-vous sûr de vouloir supprimer cette action ?"
            onCancel={() => setIsDeletionConfirmationModalOpen(false)}
            onConfirm={confirmDeletion}
            title="Suppression de l'action"
          />,
          newWindowContainerRef.current
        )}
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

const StyledTag = styled(Tag)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
`
