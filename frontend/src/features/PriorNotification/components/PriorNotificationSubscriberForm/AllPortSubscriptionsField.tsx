import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import { DataTable, Select } from '@mtes-mct/monitor-ui'

import { Info } from './shared/Info'
import { getPortSubscriptionTableColumns } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { Promisable } from 'type-fest'

type AllPortSubscriptionsFieldProps = Readonly<{
  isDisabled: boolean
  onAdd: (newPortLocode: string, isFullPortSubscription: boolean) => Promisable<void>
  onRemove: (portLocodeToRemove: string, isFullPortSubscription: boolean) => Promisable<void>
  portSubscriptions: PriorNotificationSubscriber.PortSubscription[]
}>
export function AllPortSubscriptionsField({
  isDisabled,
  onAdd,
  onRemove,
  portSubscriptions
}: AllPortSubscriptionsFieldProps) {
  const { portsAsOptions } = useGetPortsAsOptions()

  const add = (newPortLocode: string | undefined) => {
    if (!newPortLocode) {
      return
    }

    onAdd(newPortLocode, false)
  }

  const remove = (portLocodeToRemove: string) => {
    onRemove(portLocodeToRemove, false)
  }

  const columns = getPortSubscriptionTableColumns(remove, false, isDisabled)

  return (
    <>
      <BackOfficeSubtitle $isFirst $withSmallBottomMargin>
        Ports de diffusion de base de l’unité
      </BackOfficeSubtitle>
      <Info>
        Les préavis de ces ports seront diffusés si les navires ont une note de risque égale ou supérieure à 2,3. Ils
        seront vérifiés par le CNSP avant leur diffusion.
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
