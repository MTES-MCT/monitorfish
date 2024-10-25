import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import { DataTable, Select } from '@mtes-mct/monitor-ui'

import { Info } from './shared/Info'
import { getPortSubscriptionTableColumns } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { Promisable } from 'type-fest'

type FullPortSubscriptionsFieldProps = Readonly<{
  isDisabled: boolean
  onAdd: (newPortLocode: string, isFullPortSubscription: boolean) => Promisable<void>
  onRemove: (portLocodeToRemove: string, isFullPortSubscription: boolean) => Promisable<void>
  portSubscriptions: PriorNotificationSubscriber.PortSubscription[]
}>
export function FullPortSubscriptionsField({
  isDisabled,
  onAdd,
  onRemove,
  portSubscriptions
}: FullPortSubscriptionsFieldProps) {
  const { portsAsOptions } = useGetPortsAsOptions()

  const add = (newPortLocode: string | undefined) => {
    if (!newPortLocode) {
      return
    }

    onAdd(newPortLocode, true)
  }

  const remove = (portLocodeToRemove: string) => {
    onRemove(portLocodeToRemove, true)
  }

  const columns = getPortSubscriptionTableColumns(remove, isDisabled)

  return (
    <>
      <BackOfficeSubtitle $isFirst $withSmallBottomMargin>
        Ajouter tous les préavis d’un port à la diffusion
      </BackOfficeSubtitle>
      <Info>
        Tous les préavis de ces ports seront diffusés, sans faire partie du périmètre de vérification du CNSP.
      </Info>

      <DataTable
        columns={columns}
        data={portSubscriptions}
        initialSorting={[{ desc: false, id: 'portName' }]}
        tableOptions={{
          getRowId: originalRow => `${originalRow.controlUnitId}-${originalRow.portLocode}`
        }}
        withoutHead
      />

      <Select
        disabled={!portsAsOptions || isDisabled}
        isLabelHidden
        label="Ajouter un port de diffusion"
        name="portSubscription"
        onChange={add}
        options={portsAsOptions ?? []}
      />
    </>
  )
}
