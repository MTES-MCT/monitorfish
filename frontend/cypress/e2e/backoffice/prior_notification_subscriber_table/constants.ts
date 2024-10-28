import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'

export const FAKE_PRIOR_NOTIFICATION_SUBSCRIBERS: PriorNotificationSubscriber.Subscriber[] = [
  {
    controlUnit: {
      administration: {
        id: 101,
        name: 'Administration 1'
      },
      id: 1,
      name: 'Unité 1'
    },
    fleetSegmentSubscriptions: [
      {
        controlUnitId: 1,
        segmentCode: 'SEG001',
        segmentName: 'Segment 1'
      },
      {
        controlUnitId: 1,
        segmentCode: 'SEG002',
        segmentName: 'Segment 2'
      },
      {
        controlUnitId: 1,
        segmentCode: 'SEG003',
        segmentName: 'Segment 3'
      },
      {
        controlUnitId: 1,
        segmentCode: 'SEG004',
        segmentName: undefined
      }
    ],
    portSubscriptions: [
      {
        controlUnitId: 1,
        hasSubscribedToAllPriorNotifications: false,
        portLocode: 'FRABC',
        portName: 'Port Français'
      },
      {
        controlUnitId: 1,
        hasSubscribedToAllPriorNotifications: true,
        portLocode: 'GBDEF',
        portName: 'Port Anglais'
      },
      {
        controlUnitId: 1,
        hasSubscribedToAllPriorNotifications: false,
        portLocode: 'ESGHI',
        portName: 'Port Espagnol'
      },
      {
        controlUnitId: 1,
        hasSubscribedToAllPriorNotifications: false,
        portLocode: 'ZZJKL',
        portName: undefined
      }
    ],
    vesselSubscriptions: [
      {
        controlUnitId: 1,
        vesselCallSign: 'CALLSIGN001',
        vesselCfr: 'CFR001',
        vesselExternalMarking: 'EXT001',
        vesselId: 100001,
        vesselMmsi: 'MMSI001',
        vesselName: 'Navire 1'
      },
      {
        controlUnitId: 1,
        vesselCallSign: 'CALLSIGN002',
        vesselCfr: 'CFR002',
        vesselExternalMarking: 'EXT002',
        vesselId: 100002,
        vesselMmsi: 'MMSI002',
        vesselName: 'Navire 2'
      },
      {
        controlUnitId: 1,
        vesselCallSign: 'CALLSIGN003',
        vesselCfr: 'CFR003',
        vesselExternalMarking: 'EXT003',
        vesselId: 100003,
        vesselMmsi: 'MMSI003',
        vesselName: 'Navire 3'
      },
      {
        controlUnitId: 1,
        vesselCallSign: undefined,
        vesselCfr: undefined,
        vesselExternalMarking: undefined,
        vesselId: 100004,
        vesselMmsi: undefined,
        vesselName: undefined
      }
    ]
  }
]
