import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { DataTable, Select } from '@mtes-mct/monitor-ui'

import { getSegmentSubscriptionTableColumns } from './columns'
import { Info } from './shared/Info'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { Promisable } from 'type-fest'

type SegmentSubscriptionsFieldProps = Readonly<{
  isDisabled: boolean
  onAdd: (newSegmentCode: string) => Promisable<void>
  onRemove: (segmentCodeToRemove: string) => Promisable<void>
  segmentSubscriptions: PriorNotificationSubscriber.SegmentSubscription[]
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
        initialSorting={[{ desc: false, id: 'segmentName' }]}
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
