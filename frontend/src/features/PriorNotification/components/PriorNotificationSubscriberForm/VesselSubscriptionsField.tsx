import { BackOfficeSubtitle } from '@features/BackOffice/components/BackOfficeSubtitle'
import { VesselSearch } from '@features/Vessel/components/VesselSearch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { DataTable, useKey } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Info } from './shared/Info'
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

  const add = (newVesselIdentity: Vessel.VesselIdentity | undefined) => {
    if (!newVesselIdentity?.vesselId) {
      return
    }

    onAdd(newVesselIdentity.vesselId)
  }

  const remove = (vesselIdToRemove: number) => {
    onRemove(vesselIdToRemove)
  }

  const columns = getVesselSubscriptionTableColumns(remove, isDisabled)

  return (
    <>
      <BackOfficeSubtitle $withSmallBottomMargin>
        Ajouter tous les préavis d’un navire à la diffusion
      </BackOfficeSubtitle>
      <Info>
        Tous les préavis de ces navires seront diffusés, sans faire partie du périmètre de vérification du CNSP.
      </Info>

      <DataTableWrapper>
        <DataTable
          columns={columns}
          data={vesselSubscriptions}
          initialSorting={[{ desc: false, id: 'vesselName' }]}
          tableOptions={{
            getRowId: originalRow => `${originalRow.controlUnitId}-${originalRow.vesselId}`
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
  width: 400px;

  > div:nth-child(2) {
    border: solid 1px ${p => p.theme.color.lightGray};
    width: 400px;
  }
`
