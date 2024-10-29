import { ConfirmationModal } from '@components/ConfirmationModal'
import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import { DataTable, Select } from '@mtes-mct/monitor-ui'
import { useState } from 'react'

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

  const [unsubscriptionConfirmationModalPortLocode, setUnsubscriptionConfirmationModalPortLocode] = useState<
    string | undefined
  >(undefined)

  const add = (newPortLocode: string | undefined) => {
    if (!newPortLocode) {
      return
    }

    onAdd(newPortLocode, true)
  }

  const askForRemovalConfirmation = (portLocodeToRemove: string) => {
    setUnsubscriptionConfirmationModalPortLocode(portLocodeToRemove)
  }

  const closeRemovalConfirmationModal = () => {
    setUnsubscriptionConfirmationModalPortLocode(undefined)
  }

  const remove = () => {
    if (!unsubscriptionConfirmationModalPortLocode) {
      return
    }

    closeRemovalConfirmationModal()

    onRemove(unsubscriptionConfirmationModalPortLocode, true)
  }

  const columns = getPortSubscriptionTableColumns(askForRemovalConfirmation, true, isDisabled)

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
        label="Ajouter un port de diffusion complète"
        name="fullPortSubscription"
        onChange={add}
        options={portsAsOptions ?? []}
      />

      {unsubscriptionConfirmationModalPortLocode && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <>
              <p>
                <b>Êtes-vous sûr de vouloir supprimer ce port de diffusion ?</b>
              </p>
              <p>
                L’unité ne recevra plus les préavis des navires ayant une note de risque supérieure à 2,3 lorsqu’ils
                débarquent dans ce port.
              </p>
            </>
          }
          onCancel={closeRemovalConfirmationModal}
          onConfirm={remove}
          title="Supprimer un port de diffusion"
        />
      )}
    </>
  )
}
