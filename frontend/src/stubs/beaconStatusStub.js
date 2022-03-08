const yesterdayDate = new Date()
yesterdayDate.setDate(yesterdayDate.getDate() - 1)

export const beaconMalfunctionsStub = [
  {
    beaconMalfunction: {
      id: 3,
      internalReferenceNumber: 'U_W0NTFINDME',
      externalReferenceNumber: 'TALK2ME',
      ircs: 'QGDF',
      vesselIdentifier: 'IRCS',
      vesselName: 'MALOTRU',
      vesselStatus: 'NO_NEWS',
      stage: 'INITIAL_ENCOUNTER',
      priority: true,
      malfunctionStartDateTime: '2021-12-27T09:26:09.364422Z',
      malfunctionEndDateTime: null,
      vesselStatusLastModificationDateTime: '2022-01-10T14:10:12.351164'
    },
    comments: [
      {
        id: 1,
        comment: 'A comment',
        userType: 'OPS',
        dateTime: yesterdayDate.toISOString()
      }
    ],
    actions: [
      {
        beaconMalfunctionId: 1,
        propertyName: 'VESSEL_STATUS',
        previousValue: 'AT_PORT',
        nextValue: 'TECHNICAL_STOP',
        dateTime: '2022-01-03T08:49:29.087756Z'
      },
      {
        beaconMalfunctionId: 1,
        propertyName: 'VESSEL_STATUS',
        previousValue: 'TECHNICAL_STOP',
        nextValue: 'ACTIVITY_DETECTED',
        dateTime: '2022-01-17T09:27:20.544785Z'
      }
    ]
  },
  {
    beaconMalfunction: {
      id: 4,
      internalReferenceNumber: 'U_W0NTFINDME',
      externalReferenceNumber: 'TALK2ME',
      ircs: 'QGDF',
      vesselIdentifier: 'IRCS',
      vesselName: 'MALOTRU',
      vesselStatus: 'AT_SEA',
      stage: 'RESUMED_TRANSMISSION',
      priority: true,
      malfunctionStartDateTime: '2021-12-27T09:26:09.364422Z',
      malfunctionEndDateTime: null,
      vesselStatusLastModificationDateTime: '2022-01-10T14:10:12.351164'
    },
    comments: [
      {
        id: 1,
        comment: 'A comment',
        userType: 'OPS',
        dateTime: '2021-12-27T09:26:09.364422Z'
      }
    ]
  },
  {
    beaconMalfunction: {
      id: 5,
      internalReferenceNumber: 'U_W0NTFINDME',
      externalReferenceNumber: 'TALK2ME',
      ircs: 'QGDF',
      vesselIdentifier: 'IRCS',
      vesselName: 'MALOTRU',
      vesselStatus: 'AT_PORT',
      stage: 'RESUMED_TRANSMISSION',
      priority: true,
      malfunctionStartDateTime: '2021-12-27T09:26:09.364422Z',
      malfunctionEndDateTime: null,
      vesselStatusLastModificationDateTime: '2022-01-10T14:10:12.351164'
    },
    comments: [
      {
        id: 1,
        comment: 'A comment',
        userType: 'OPS',
        dateTime: '2021-12-27T09:26:09.364422Z'
      }
    ]
  },
  {
    beaconMalfunction: {
      id: 6,
      internalReferenceNumber: 'U_W0NTFINDME',
      externalReferenceNumber: 'TALK2ME',
      ircs: 'QGDF',
      vesselIdentifier: 'IRCS',
      vesselName: 'MALOTRU',
      vesselStatus: 'TECHNICAL_STOP',
      stage: 'RESUMED_TRANSMISSION',
      priority: true,
      malfunctionStartDateTime: '2021-12-27T09:26:09.364422Z',
      malfunctionEndDateTime: null,
      vesselStatusLastModificationDateTime: '2022-01-10T14:10:12.351164'
    },
    comments: [
      {
        id: 1,
        comment: 'A comment',
        userType: 'OPS',
        dateTime: '2021-12-27T09:26:09.364422Z'
      }
    ],
    actions: [
      {
        beaconMalfunctionId: 1,
        propertyName: 'VESSEL_STATUS',
        previousValue: 'AT_PORT',
        nextValue: 'TECHNICAL_STOP',
        dateTime: '2022-01-03T08:49:29.087756Z'
      },
      {
        beaconMalfunctionId: 1,
        propertyName: 'VESSEL_STATUS',
        previousValue: 'TECHNICAL_STOP',
        nextValue: 'ACTIVITY_DETECTED',
        dateTime: '2022-01-17T09:27:20.544785Z'
      }
    ]
  },
  {
    beaconMalfunction: {
      id: 7,
      internalReferenceNumber: 'U_W0NTFINDME',
      externalReferenceNumber: 'TALK2ME',
      ircs: 'QGDF',
      vesselIdentifier: 'IRCS',
      vesselName: 'MALOTRU',
      vesselStatus: 'ACTIVITY_DETECTED',
      stage: 'RESUMED_TRANSMISSION',
      priority: true,
      malfunctionStartDateTime: '2021-12-27T09:26:09.364422Z',
      malfunctionEndDateTime: null,
      vesselStatusLastModificationDateTime: '2022-01-10T14:10:12.351164'
    },
    comments: [
      {
        id: 1,
        comment: 'A comment',
        userType: 'OPS',
        dateTime: '2021-12-27T09:26:09.364422Z'
      }
    ]
  }
]
