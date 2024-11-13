import { ConfirmationModal } from '@components/ConfirmationModal'
import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { DataTable, Select } from '@mtes-mct/monitor-ui'
import { useState } from 'react'

import { EmptyDataLabel, Info } from './styles'
import { getSegmentSubscriptionTableColumns } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { Promisable } from 'type-fest'

type SegmentSubscriptionsFieldProps = Readonly<{
  fleetSegmentSubscriptions: PriorNotificationSubscriber.FleetSegmentSubscription[]
  isDisabled: boolean
  onAdd: (newSegmentCode: string) => Promisable<void>
  onRemove: (segmentCodeToRemove: string) => Promisable<void>
}>
export function SegmentSubscriptionsField({
  fleetSegmentSubscriptions,
  isDisabled,
  onAdd,
  onRemove
}: SegmentSubscriptionsFieldProps) {
  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()

  const [unsubscriptionConfirmationModalFleetSegmentCode, setUnsubscriptionConfirmationModalFleetSegmentCode] =
    useState<string | undefined>(undefined)

  const add = (newSegmentCode: string | undefined) => {
    if (!newSegmentCode) {
      return
    }

    onAdd(newSegmentCode)
  }

  const askForRemovalConfirmation = (fleetSegmentCodeToRemove: string) => {
    setUnsubscriptionConfirmationModalFleetSegmentCode(fleetSegmentCodeToRemove)
  }

  const closeRemovalConfirmationModal = () => {
    setUnsubscriptionConfirmationModalFleetSegmentCode(undefined)
  }

  const remove = () => {
    if (!unsubscriptionConfirmationModalFleetSegmentCode) {
      return
    }

    closeRemovalConfirmationModal()

    onRemove(unsubscriptionConfirmationModalFleetSegmentCode)
  }

  const columns = getSegmentSubscriptionTableColumns(askForRemovalConfirmation, isDisabled)

  return (
    <>
      <BackOfficeSubtitle $withSmallBottomMargin>
        Ajouter tous les préavis d’un segment à la diffusion
      </BackOfficeSubtitle>
      <Info>
        Tous les préavis des navires appartenant à ces segments seront diffusés, sans faire partie du périmètre de
        vérification du CNSP.
      </Info>

      <DataTable
        columns={columns}
        data={fleetSegmentSubscriptions}
        emptyLabel={<EmptyDataLabel>Aucun segment ajouté.</EmptyDataLabel>}
        initialSorting={[{ desc: false, id: 'name' }]}
        tableOptions={{
          getRowId: originalRow => `${originalRow.controlUnitId}-${originalRow.segmentCode}`
        }}
        withoutHead
      />

      <Select
        disabled={!fleetSegmentsAsOptions || isDisabled}
        isLabelHidden
        label="Ajouter un segment de flotte"
        name="fleetSegmentSubscription"
        onChange={add}
        options={fleetSegmentsAsOptions ?? []}
        searchable
      />

      {unsubscriptionConfirmationModalFleetSegmentCode && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <>
              <p>
                <b>Êtes-vous sûr de vouloir supprimer ce segment des diffusions ?</b>
              </p>
              <p>L’unité ne recevra plus les préavis de ce segment qui sont hors de la diffusion de base.</p>
            </>
          }
          onCancel={closeRemovalConfirmationModal}
          onConfirm={remove}
          title="Supprimer un segment des diffusions"
        />
      )}
    </>
  )
}
