import { ConfirmationModal } from '@components/ConfirmationModal'
import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { VesselSearch } from '@features/Vessel/components/VesselSearch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { DataTable, useKey } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { EmptyDataLabel, Info } from './styles'
import { getVesselSubscriptionTableColumns } from './utils'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Promisable } from 'type-fest'

type VesselSubscriptionsFieldProps = Readonly<{
  isDisabled: boolean
  onAdd: (newVesselId: number) => Promisable<void>
  onRemove: (vesselIdRemove: number) => Promisable<void>
  vesselSubscriptions: PriorNotificationSubscriber.VesselSubscription[]
}>
export function VesselSubscriptionsField({
  isDisabled,
  onAdd,
  onRemove,
  vesselSubscriptions
}: VesselSubscriptionsFieldProps) {
  const key = useKey([vesselSubscriptions])

  const [unsubscriptionConfirmationModalVesselId, setUnsubscriptionConfirmationModalVesselId] = useState<
    number | undefined
  >(undefined)

  const add = (newVesselIdentity: Vessel.VesselIdentity | undefined) => {
    if (!newVesselIdentity?.vesselId) {
      return
    }

    onAdd(newVesselIdentity.vesselId)
  }

  const askForRemovalConfirmation = (vesselIdToRemove: number) => {
    setUnsubscriptionConfirmationModalVesselId(vesselIdToRemove)
  }

  const closeRemovalConfirmationModal = () => {
    setUnsubscriptionConfirmationModalVesselId(undefined)
  }

  const remove = () => {
    if (!unsubscriptionConfirmationModalVesselId) {
      return
    }

    closeRemovalConfirmationModal()

    onRemove(unsubscriptionConfirmationModalVesselId)
  }

  const columns = getVesselSubscriptionTableColumns(askForRemovalConfirmation, isDisabled)

  return (
    <>
      <BackOfficeSubtitle $withSmallBottomMargin>Diffuser des préavis supplémentaires par navire</BackOfficeSubtitle>
      <Info>
        Tous les préavis de ces navires seront diffusés, sans faire partie du périmètre de vérification du CNSP.
      </Info>

      <DataTableWrapper>
        <DataTable
          columns={columns}
          data={vesselSubscriptions}
          emptyLabel={<EmptyDataLabel>Aucun navire ajouté.</EmptyDataLabel>}
          initialSorting={[{ desc: false, id: 'vesselName' }]}
          tableOptions={{
            getRowId: originalRow => String(originalRow.vesselId)
          }}
          withoutHead
        />
      </DataTableWrapper>

      <StyledVesselSearch
        key={key}
        disabled={isDisabled}
        displayedErrorKey={DisplayedErrorKey.BACK_OFFICE_PRIOR_NOTIFICATION_SUBSCRIBER_FORM_ERROR}
        onChange={add}
        shouldCloseOnClickOutside
      />

      {unsubscriptionConfirmationModalVesselId && (
        <ConfirmationModal
          confirmationButtonLabel="Confirmer la suppression"
          message={
            <>
              <p>
                <b>Êtes-vous sûr de vouloir supprimer ce navire des diffusions ?</b>
              </p>
              <p>L’unité ne recevra plus les préavis de ce navire qui sont hors de la diffusion de base.</p>
            </>
          }
          onCancel={closeRemovalConfirmationModal}
          onConfirm={remove}
          title="Supprimer un navire des diffusions"
        />
      )}
    </>
  )
}

const DataTableWrapper = styled.div`
  > .Table-SimpleTable {
    margin-bottom: 16px;
    width: 1000px;
  }
`

const StyledVesselSearch = styled(VesselSearch)`
  border: solid 1px ${p => p.theme.color.lightGray};
  width: 760px;

  > div:nth-child(2) {
    border: solid 1px ${p => p.theme.color.lightGray};
    width: 760px;
  }
`
