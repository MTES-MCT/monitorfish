import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { DataTable, Select } from '@mtes-mct/monitor-ui'

import { EmptyDataLabel, Info } from './styles'
import { getSegmentSubscriptionTableColumns } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { Promisable } from 'type-fest'

type SegmentSubscriptionsFieldProps = Readonly<{
  isDisabled: boolean
  onAdd: (newSegmentCode: string) => Promisable<void>
  onRemove: (segmentCodeToRemove: string) => Promisable<void>
  segmentSubscriptions: PriorNotificationSubscriber.FleetSegmentSubscription[]
}>
export function SegmentSubscriptionsField({
  isDisabled,
  onAdd,
  onRemove,
  segmentSubscriptions
}: SegmentSubscriptionsFieldProps) {
  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()

  const add = (newSegmentCode: string | undefined) => {
    if (!newSegmentCode) {
      return
    }

    onAdd(newSegmentCode)
  }

  const remove = (segmentCodeToRemove: string) => {
    onRemove(segmentCodeToRemove)
  }

  const columns = getSegmentSubscriptionTableColumns(remove, isDisabled)

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
        data={segmentSubscriptions}
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
      />
    </>
  )
}
