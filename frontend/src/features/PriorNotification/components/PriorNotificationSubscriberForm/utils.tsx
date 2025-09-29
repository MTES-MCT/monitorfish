import { Ellipsised } from '@components/Ellipsised'
import { Accent, Checkbox, Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { PriorNotificationSubscriber } from '../../PriorNotificationSubscriber.types'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { AccessorColumnDef } from '@tanstack/table-core/build/lib/types'
import type { Promisable } from 'type-fest'

export function getFormDataFromSubscriber(
  subscriber: PriorNotificationSubscriber.Subscriber
): PriorNotificationSubscriber.FormData {
  return {
    controlUnitId: subscriber.controlUnit.id,
    fleetSegmentCodes: subscriber.fleetSegmentSubscriptions.map(subscription => subscription.segmentCode),
    portLocodes: subscriber.portSubscriptions.map(subscription => subscription.portLocode),
    portLocodesWithFullSubscription: subscriber.portSubscriptions
      .filter(subscription => subscription.hasSubscribedToAllPriorNotifications)
      .map(subscription => subscription.portLocode),
    vesselIds: subscriber.vesselSubscriptions.map(subscription => subscription.vesselId)
  }
}

export function getPortSubscriptionTableColumns(
  onRemove: (portLocodeToRemove: string) => Promisable<void>,
  onFullSubscriptionCheck: (portLocode: string) => Promisable<void>,
  onFullSubscriptionUncheck: (portLocode: string) => Promisable<void>,
  isDisabled: boolean
): Array<AccessorColumnDef<PriorNotificationSubscriber.PortSubscription>> {
  return [
    {
      accessorFn: row => row.portName,
      header: () => 'Port',
      id: 'portName'
    },
    {
      accessorFn: row => row,
      cell: context => {
        const portSubscription = context.getValue() as PriorNotificationSubscriber.PortSubscription

        return (
          <StyledCheckbox
            checked={portSubscription.hasSubscribedToAllPriorNotifications}
            label="tous les préavis"
            name="hasSubscribedToAllPriorNotifications"
            onChange={
              portSubscription.hasSubscribedToAllPriorNotifications
                ? () => onFullSubscriptionUncheck(portSubscription.portLocode)
                : () => onFullSubscriptionCheck(portSubscription.portLocode)
            }
          />
        )
      },
      enableSorting: false,
      header: () => '',
      id: 'toggleFullSubscription',
      size: 160
    },
    {
      accessorFn: row => row.portLocode,
      cell: context => (
        <IconButton
          accent={Accent.TERTIARY}
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue() as string)}
          title="Désinscrire l'unité de tous les préavis liés à ce port"
        />
      ),
      enableSorting: false,
      header: () => '',
      id: 'remove',
      size: 44
    }
  ]
}

export function getSegmentSubscriptionTableColumns(
  onRemove: (segmentCodeToRemove: string) => Promisable<void>,
  isDisabled: boolean
): Array<ColumnDef<PriorNotificationSubscriber.FleetSegmentSubscription, any>> {
  return [
    {
      accessorFn: row => `${row.segmentCode} (${row.segmentName})`,
      header: () => 'Segment',
      id: 'name'
    },
    {
      accessorFn: row => row.segmentCode,
      cell: (context: CellContext<PriorNotificationSubscriber.FleetSegmentSubscription, string>) => (
        <IconButton
          accent={Accent.TERTIARY}
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          title="Désinscrire l'unité de tous les préavis liés à ce segment de flotte"
        />
      ),
      enableSorting: false,
      header: () => '',
      id: 'remove',
      size: 44
    }
  ]
}

export function getVesselSubscriptionTableColumns(
  onRemove: (vesselIdToRemove: number) => Promisable<void>,
  isDisabled: boolean
): Array<ColumnDef<PriorNotificationSubscriber.VesselSubscription, any>> {
  return [
    {
      accessorFn: row => row.vesselName,
      cell: (context: CellContext<PriorNotificationSubscriber.VesselSubscription, string>) => (
        <Ellipsised>{context.getValue()}</Ellipsised>
      ),
      header: () => 'Navire',
      id: 'vesselName',
      size: 140
    },
    {
      accessorFn: row => row,
      cell: (
        context: CellContext<
          PriorNotificationSubscriber.VesselSubscription,
          PriorNotificationSubscriber.VesselSubscription
        >
      ) => {
        const vesselSubscription = context.getValue()

        return (
          <span>
            {vesselSubscription.vesselCfr && (
              <>
                {vesselSubscription.vesselCfr} <VesselIdentifierLabel>(CFR)</VesselIdentifierLabel>
                {' - '}
              </>
            )}
            {vesselSubscription.vesselMmsi && (
              <>
                {vesselSubscription.vesselMmsi} <VesselIdentifierLabel>(MMSI)</VesselIdentifierLabel>
                {' - '}
              </>
            )}
            {vesselSubscription.vesselExternalMarking && (
              <>
                {vesselSubscription.vesselExternalMarking} <VesselIdentifierLabel>(Marq. ext.)</VesselIdentifierLabel>
                {' - '}
              </>
            )}
            {vesselSubscription.vesselCallSign && (
              <>
                {vesselSubscription.vesselCallSign} <VesselIdentifierLabel>(Call Sign)</VesselIdentifierLabel>
              </>
            )}
          </span>
        )
      },
      header: () => 'Immatriculations',
      id: 'vesselIdentity'
    },
    {
      accessorFn: row => row.vesselId,
      cell: (context: CellContext<PriorNotificationSubscriber.VesselSubscription, number>) => (
        <IconButton
          accent={Accent.TERTIARY}
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          title="Désinscrire l'unité de tous les préavis liés à ce navire"
        />
      ),
      enableSorting: false,
      header: () => '',
      id: 'remove',
      size: 44
    }
  ]
}

const StyledCheckbox = styled(Checkbox)`
  .rs-checkbox-checker {
    line-height: 18px;
  }
`

const VesselIdentifierLabel = styled.span`
  color: #ff3392;
`
