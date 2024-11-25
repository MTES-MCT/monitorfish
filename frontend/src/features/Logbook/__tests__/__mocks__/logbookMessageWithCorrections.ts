import { Logbook } from '@features/Logbook/Logbook.types'

export const farMessagesWithCorrections: Logbook.FarMessage[] = [
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-07T14:05:25.243382Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-07T14:05:25.243382Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-07T13:59:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -4.544,
          longitude: 55.467,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-07T14:00:00Z',
    operationNumber: 'OOE20240707041402',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-07T14:00:00Z',
    reportId: 'OOE20240707041402',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-08T09:25:22.831771Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-08T09:25:22.831771Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 13000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 6000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'KAW',
              speciesName: 'Thonine orientale',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-08T06:25:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -1.28,
          longitude: 55.045,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-08T09:21:00Z',
    operationNumber: 'OOE20240708041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-08T09:21:00Z',
    reportId: 'OOE20240708041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-09T13:45:25.756139Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-09T13:45:25.756139Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-09T13:37:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 0.355,
          longitude: 55.51,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-09T13:38:00Z',
    operationNumber: 'OOE20240709041402',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-09T13:38:00Z',
    reportId: 'OOE20240709041402',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-10T05:40:18.039069Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-10T05:40:18.039069Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: true,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 9000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 19000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obèse(=Patudo)',
              statisticalRectangle: undefined,
              weight: 8000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'RRU',
              speciesName: 'Comète saumon',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-10T02:45:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 0.427,
          longitude: 55.691,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-10T05:33:00Z',
    operationNumber: 'OOE20240710041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-10T05:33:00Z',
    reportId: 'OOE20240710041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-10T07:00:16.479819Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-10T07:00:16.479819Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: true,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 9000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 25000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obèse(=Patudo)',
              statisticalRectangle: undefined,
              weight: 2000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'RRU',
              speciesName: 'Com¨te saumon',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-10T02:45:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 0.427,
          longitude: 55.691,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-10T06:49:00Z',
    operationNumber: 'OOE20240710041402',
    operationType: Logbook.OperationType.COR,
    rawMessage: '',
    referencedReportId: 'OOE20240710041400',
    reportDateTime: '2024-07-10T06:49:00Z',
    reportId: 'OOE20240710041402',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-10T12:45:21.711899Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-10T12:45:21.711899Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 15000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 9000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obÃ¨se(=Patudo)',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-10T10:15:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 1.108,
          longitude: 55.835,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-10T12:35:00Z',
    operationNumber: 'OOE20240710041403',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-10T12:35:00Z',
    reportId: 'OOE20240710041403',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-11T08:00:14.216459Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-11T08:00:14.216459Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 21000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 31000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obÃ¨se(=Patudo)',
              statisticalRectangle: undefined,
              weight: 1000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'RRU',
              speciesName: 'ComÃ¨te saumon',
              statisticalRectangle: undefined,
              weight: 500.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'WAH',
              speciesName: 'Thazard-bÃ¢tard',
              statisticalRectangle: undefined,
              weight: 400.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'GBA',
              speciesName: 'Barracuda',
              statisticalRectangle: undefined,
              weight: 400.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'DOL',
              speciesName: 'CoryphÃ¨ne commune',
              statisticalRectangle: undefined,
              weight: 100.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'CNT',
              speciesName: 'Baliste rude',
              statisticalRectangle: undefined,
              weight: 100.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: undefined,
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'KAW',
              speciesName: 'Thonine orientale',
              statisticalRectangle: undefined,
              weight: 500.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-11T04:50:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 0.114,
          longitude: 55.819,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-11T07:51:00Z',
    operationNumber: 'OOE20240711041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-11T07:51:00Z',
    reportId: 'OOE20240711041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-11T08:25:22.568681Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-11T08:25:22.568681Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 10000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 25000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obÃ¨se(=Patudo)',
              statisticalRectangle: undefined,
              weight: 2000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-10T02:45:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 0.427,
          longitude: 55.691,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-11T08:17:00Z',
    operationNumber: 'OOE20240711041402',
    operationType: Logbook.OperationType.COR,
    rawMessage: '',
    referencedReportId: 'OOE20240710041402',
    reportDateTime: '2024-07-11T08:17:00Z',
    reportId: 'OOE20240711041402',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-11T13:35:19.905172Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-11T13:35:19.905172Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'ALB',
              speciesName: 'Germon',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-11T10:30:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.246,
          longitude: 55.926,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-11T13:26:00Z',
    operationNumber: 'OOE20240711041403',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-11T13:26:00Z',
    reportId: 'OOE20240711041403',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-11T15:15:22.279809Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-11T15:15:22.279809Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-11T15:00:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.155,
          longitude: 55.857,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-11T15:10:00Z',
    operationNumber: 'OOE20240711041404',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-11T15:10:00Z',
    reportId: 'OOE20240711041404',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-12T06:20:14.926898Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-12T06:20:14.926898Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-12T04:45:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.03,
          longitude: 55.847,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-12T06:14:00Z',
    operationNumber: 'OOE20240712041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-12T06:14:00Z',
    reportId: 'OOE20240712041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-12T11:20:13.832922Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-12T11:20:13.832922Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: true,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-12T09:15:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.052,
          longitude: 55.729,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-12T11:16:00Z',
    operationNumber: 'OOE20240712041401',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-12T11:16:00Z',
    reportId: 'OOE20240712041401',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-12T12:50:14.582432Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-12T12:50:14.582432Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-12T09:15:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.052,
          longitude: 55.729,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-12T12:42:00Z',
    operationNumber: 'OOE20240712041402',
    operationType: Logbook.OperationType.COR,
    rawMessage: '',
    referencedReportId: 'OOE20240712041401',
    reportDateTime: '2024-07-12T12:42:00Z',
    reportId: 'OOE20240712041402',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-13T06:15:17.901886Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-13T06:15:17.901886Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-13T04:30:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 0.141,
          longitude: 55.59,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-13T06:07:00Z',
    operationNumber: 'OOE20240713041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-13T06:07:00Z',
    reportId: 'OOE20240713041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-14T05:50:12.22278Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-14T05:50:12.22278Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 11000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 1000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'KAW',
              speciesName: 'Thonine orientale',
              statisticalRectangle: undefined,
              weight: 3000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-14T02:45:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 3.35,
          longitude: 57.192,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-14T05:44:00Z',
    operationNumber: 'OOE20240714041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-14T05:44:00Z',
    reportId: 'OOE20240714041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-14T09:50:15.297832Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-14T09:50:15.297832Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 13000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 3000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-14T07:10:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 3.476,
          longitude: 57.382,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-14T09:41:00Z',
    operationNumber: 'OOE20240714041402',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-14T09:41:00Z',
    reportId: 'OOE20240714041402',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-15T13:55:23.493016Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-15T13:55:23.493016Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-15T13:48:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 3.014,
          longitude: 56.559,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-15T13:49:00Z',
    operationNumber: 'OOE20240715041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-15T13:49:00Z',
    reportId: 'OOE20240715041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-16T09:15:21.877721Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-16T09:15:21.877721Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 5000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 25000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 3000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obèse(=Patudo)',
              statisticalRectangle: undefined,
              weight: 1000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obèse(=Patudo)',
              statisticalRectangle: undefined,
              weight: 1000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-16T06:00:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: 2.453,
          longitude: 54.396,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-16T09:06:00Z',
    operationNumber: 'OOE20240716041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-16T09:06:00Z',
    reportId: 'OOE20240716041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-17T10:00:15.09193Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-17T10:00:15.09193Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'XIN',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 60000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-17T07:10:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.116,
          longitude: 54.532,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-17T09:53:00Z',
    operationNumber: 'OOE20240717041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-17T09:53:00Z',
    reportId: 'OOE20240717041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-18T10:15:24.57132Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-18T10:15:24.57132Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-17T13:40:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.403,
          longitude: 54.265,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-17T15:22:00Z',
    operationNumber: 'OOE20240717041401',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-17T15:22:00Z',
    reportId: 'OOE20240717041401',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-18T10:15:23.783076Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-18T10:15:23.783076Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: true,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 7000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'YFT',
              speciesName: 'Albacore',
              statisticalRectangle: undefined,
              weight: 2000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 27000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 6000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-18T03:00:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.778,
          longitude: 53.812,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-18T05:40:00Z',
    operationNumber: 'OOE20240718041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-18T05:40:00Z',
    reportId: 'OOE20240718041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-19T16:55:26.609034Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-19T16:55:26.609034Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-19T16:47:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -1.663,
          longitude: 55.092,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-19T16:49:00Z',
    operationNumber: 'OOE20240719041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-19T16:49:00Z',
    reportId: 'OOE20240719041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-20T12:35:23.170176Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-20T12:35:23.170176Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obèse(=Patudo)',
              statisticalRectangle: undefined,
              weight: 5000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'BET',
              speciesName: 'Thon obèse(=Patudo)',
              statisticalRectangle: undefined,
              weight: 17000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 14000.0
            },
            {
              conversionFactor: 1.0,
              economicZone: 'SYC',
              effortZone: undefined,
              faoZone: '51.5',
              freshness: undefined,
              nbFish: undefined,
              packaging: 'BUL',
              presentation: 'WHL',
              preservationState: 'FRO',
              species: 'SKJ',
              speciesName: 'Listao',
              statisticalRectangle: undefined,
              weight: 6000.0
            }
          ],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-18T03:00:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -0.778,
          longitude: 53.812,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-20T12:26:00Z',
    operationNumber: 'OOE20240720041400',
    operationType: Logbook.OperationType.COR,
    rawMessage: '',
    referencedReportId: 'OOE20240718041400',
    reportDateTime: '2024-07-20T12:26:00Z',
    reportId: 'OOE20240720041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-20T14:00:15.741824Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-20T14:00:15.741824Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-20T13:48:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -3.224,
          longitude: 55.175,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-20T13:55:00Z',
    operationNumber: 'OOE20240720041401',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-20T13:55:00Z',
    reportId: 'OOE20240720041401',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  },
  {
    acknowledgment: {
      dateTime: undefined,
      isSuccess: true,
      rejectionCause: undefined,
      returnStatus: '000'
    },
    activityDateTime: '2024-07-21T00:20:16.096837Z',
    externalReferenceNumber: 'CC789456',
    flagState: 'FRA',
    imo: undefined,
    integrationDateTime: '2024-07-21T00:20:16.096837Z',
    internalReferenceNumber: 'FRA000123456',
    ircs: 'PMEN',
    isCorrectedByNewerMessage: false,
    isDeleted: false,
    isSentByFailoverSoftware: false,
    message: {
      hauls: [
        {
          catches: [],
          dimensions: '1600;247',
          farDatetimeUtc: '2024-07-21T00:12:00Z',
          gear: 'PS',
          gearName: 'Sennes coulissantes',
          latitude: -4.408,
          longitude: 55.457,
          mesh: 50.0
        }
      ]
    },
    messageType: Logbook.MessageType.FAR,
    operationDateTime: '2024-07-21T00:13:00Z',
    operationNumber: 'OOE20240721041400',
    operationType: Logbook.OperationType.DAT,
    rawMessage: '',
    referencedReportId: undefined,
    reportDateTime: '2024-07-21T00:13:00Z',
    reportId: 'OOE20240721041400',
    tripGears: [],
    tripNumber: '20240075',
    tripSegments: [],
    vesselName: 'APEEDFZF'
  }
]
