import { Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
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
  isFullPortSubscription: boolean,
  isDisabled: boolean
): Array<ColumnDef<PriorNotificationSubscriber.PortSubscription, any>> {
  return [
    {
      accessorFn: row => row.portName,
      header: () => 'Port',
      id: 'portName'
    },
    {
      accessorFn: row => row.portLocode,
      cell: (context: CellContext<PriorNotificationSubscriber.PortSubscription, string>) => (
        <IconButton
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          size={Size.SMALL}
          title={
            isFullPortSubscription
              ? "Désinscrire l'unité des préavis liés à ce port pour les navires dont la note de risque est supérieure à 2,3"
              : "Désinscrire l'unité de tous les préavis liés à ce port"
          }
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
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          size={Size.SMALL}
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
      header: () => 'Navire',
      id: 'vesselName',
      size: 320
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
                {vesselSubscription.vesselCfr} <VesselIdentifierLabel>(CFR)</VesselIdentifierLabel> -
              </>
            )}
            {vesselSubscription.vesselMmsi && (
              <>
                {vesselSubscription.vesselMmsi} <VesselIdentifierLabel>(MMSI)</VesselIdentifierLabel> -
              </>
            )}
            {vesselSubscription.vesselExternalMarking && (
              <>
                {vesselSubscription.vesselExternalMarking} <VesselIdentifierLabel>(Marq. ext.)</VesselIdentifierLabel> -
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
          disabled={isDisabled}
          Icon={Icon.Delete}
          onClick={() => onRemove(context.getValue())}
          size={Size.SMALL}
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

const VesselIdentifierLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
`
