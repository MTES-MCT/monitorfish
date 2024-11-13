import { ConfirmationModal } from '@components/ConfirmationModal'
import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import { DataTable, Select } from '@mtes-mct/monitor-ui'
import { useState } from 'react'

import { EmptyDataLabel, Info } from './styles'
import { getPortSubscriptionTableColumns } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { Promisable } from 'type-fest'

type AllPortSubscriptionsFieldProps = Readonly<{
  isDisabled: boolean
  onAdd: (newPortLocode: string) => Promisable<void>
  onFullSubscriptionCheck: (portLocode: string) => Promisable<void>
  onFullSubscriptionUncheck: (portLocode: string) => Promisable<void>
  onRemove: (portLocodeToRemove: string) => Promisable<void>
  portSubscriptions: PriorNotificationSubscriber.PortSubscription[]
}>
export function AllPortSubscriptionsField({
  isDisabled,
  onAdd,
  onFullSubscriptionCheck,
  onFullSubscriptionUncheck,
  onRemove,
  portSubscriptions
}: AllPortSubscriptionsFieldProps) {
  const { portsAsOptions } = useGetPortsAsOptions()

  const [unsubscriptionConfirmationModalPortLocode, setUnsubscriptionConfirmationModalPortLocode] = useState<
    string | undefined
  >(undefined)

  const add = (newPortLocode: string | undefined) => {
    if (!newPortLocode) {
      return
    }

    onAdd(newPortLocode)
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

    onRemove(unsubscriptionConfirmationModalPortLocode)
  }

  const columns = getPortSubscriptionTableColumns(
    askForRemovalConfirmation,
    onFullSubscriptionCheck,
    onFullSubscriptionUncheck,
    isDisabled
  )

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
        emptyLabel={<EmptyDataLabel>Aucun port ajouté.</EmptyDataLabel>}
        initialSorting={[{ desc: false, id: 'portName' }]}
        tableOptions={{
          getRowId: originalRow => originalRow.portLocode
        }}
        withoutHead
      />

      <Select
        disabled={!portsAsOptions || isDisabled}
        isLabelHidden
        label="Ajouter un port de diffusion partielle"
        name="portSubscription"
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
