import { customDayjs, THEME, Tag, getOptionsFromLabelledEnum, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { capitalizeFirstLetter } from '@utils/capitalizeFirstLetter'

import { ButtonsGroupRow } from './ButtonsGroupRow'
import { SeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
import { PriorNotification } from '../../PriorNotification.types'

import type { ColumnDef } from '@tanstack/react-table'

export const PRIOR_NOTIFICATION_TABLE_COLUMNS: Array<ColumnDef<PriorNotification.PriorNotification>> = [
  {
    accessorFn: row => row.id,
    cell: ({ row }) => (
      <TableWithSelectableRows.RowCheckbox
        disabled={!row.getCanSelect()}
        isChecked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    header: ({ table }) => (
      <TableWithSelectableRows.RowCheckbox
        isChecked={table.getIsAllRowsSelected()}
        isIndeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    id: 'select',
    size: 50
  },
  {
    accessorFn: row => row.estimatedTimeOfArrival,
    cell: info =>
      customDayjs(info.getValue() as string)
        .utc()
        .format('DD/MM/YYYY à HH[h]mm'),
    enableSorting: true,
    header: () => 'Arrivée estimée',
    id: 'estimatedTimeOfArrival',
    size: 120
  },
  {
    accessorFn: row => row.scheduledTimeOfLanding,
    cell: info =>
      customDayjs(info.getValue() as string)
        .utc()
        .format('DD/MM/YYYY à HH[h]mm'),
    enableSorting: true,
    header: () => 'Débarque prévue',
    id: 'scheduledTimeOfLanding',
    size: 120
  },
  {
    accessorFn: row => `${row.port.name} (${row.port.locode})`,
    cell: info => info.getValue(),
    enableSorting: true,
    header: () => "Port d'arrivée",
    id: 'port',
    size: 180
  },
  {
    accessorFn: row => row.vessel.riskFactor.riskFactor,
    cell: info => info.getValue(),
    enableSorting: true,
    header: () => 'Note',
    id: 'riskScore.riskScore',
    size: 50
  },
  {
    accessorFn: row => row.vessel.vesselName,
    cell: info => info.getValue(),
    enableSorting: true,
    header: () => 'Nom',
    id: 'vessel.vesselName',
    size: 140
  },
  {
    accessorFn: row => row.fleetSegments.map(fleetSegment => fleetSegment.segment).join('/'),
    cell: info => info.getValue(),
    enableSorting: true,
    header: () => 'Segments',
    id: 'fleetSegments',
    size: 100
  },
  {
    accessorFn: row => row.types.map(type => PriorNotification.PRIOR_NOTIFICATION_TYPE_LABEL[type]).join(', '),
    cell: info => capitalizeFirstLetter(info.getValue() as string),
    enableSorting: true,
    header: () => 'Types de préavis',
    id: 'types',
    size: 140
  },
  {
    accessorFn: row => row.alertCount,
    cell: info => {
      const alertCount = info.getValue() as number
      if (!alertCount) {
        return null
      }

      return (
        <Tag backgroundColor={THEME.color.maximumRed15} style={{ marginTop: 1 }}>{`${
          info.getValue() as number
        } sign.`}</Tag>
      )
    },
    enableSorting: false,
    header: () => '',
    id: 'alertCount',
    size: 60
  },
  {
    accessorFn: row => row.id,
    cell: info => <ButtonsGroupRow id={info.getValue()} />,
    enableSorting: false,
    header: () => '',
    id: 'actions',
    size: 56
  }
]

export const PRIOR_NOTIFICATION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(
  PriorNotification.PRIOR_NOTIFICATION_TYPE_LABEL
)

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const SUB_MENU_LABEL: Record<SeaFrontGroup | 'EXTRA', string> = {
  ALL: 'Vue d’ensemble',
  MED: 'MED',
  MEMN: 'MEMN',
  NAMO: 'NAMO',
  SA: 'SA',
  OUTREMEROA: 'OUTRE-MER OA',
  OUTREMEROI: 'OUTRE-MER OI',
  EXTRA: 'HORS FAÇADE'
}
export const SUB_MENUS_AS_OPTIONS = getOptionsFromLabelledEnum(SUB_MENU_LABEL)

export enum LastControlPeriod {
  AFTER_ONE_MONTH_AGO = 'AFTER_ONE_MONTH_AGO',
  BEFORE_ONE_MONTH_AGO = 'BEFORE_ONE_MONTH_AGO',
  BEFORE_ONE_YEAR_AGO = 'BEFORE_ONE_YEAR_AGO',
  BEFORE_SIX_MONTHS_AGO = 'BEFORE_SIX_MONTHS_AGO',
  BEFORE_THREE_MONTHS_AGO = 'BEFORE_THREE_MONTHS_AGO',
  BEFORE_TWO_YEARS_AGO = 'BEFORE_TWO_YEARS_AGO'
}
export const LAST_CONTROL_PERIOD_LABEL: Record<LastControlPeriod, string> = {
  AFTER_ONE_MONTH_AGO: 'Contrôlé il y a moins d’1 mois',
  BEFORE_ONE_MONTH_AGO: 'Contrôlé il y a plus d’1 mois',
  BEFORE_THREE_MONTHS_AGO: 'Contrôlé il y a plus de 3 mois',
  BEFORE_SIX_MONTHS_AGO: 'Contrôlé il y a plus de 6 mois',
  BEFORE_ONE_YEAR_AGO: 'Contrôlé il y a plus d’1 an',
  BEFORE_TWO_YEARS_AGO: 'Contrôlé il y a plus de 2 ans'
}
export const LAST_CONTROL_PERIODS_AS_OPTIONS = getOptionsFromLabelledEnum(LAST_CONTROL_PERIOD_LABEL)

export enum ReceivedAtPeriod {
  AFTER_FOUR_HOURS_AGO = 'AFTER_FOUR_HOURS_AGO',
  AFTER_HEIGTH_HOURS_AGO = 'AFTER_HEIGTH_HOURS_AGO',
  AFTER_ONE_DAY_AGO = 'AFTER_ONE_DAY_AGO',
  AFTER_TWELVE_HOURS_AGO = 'AFTER_TWELVE_HOURS_AGO',
  AFTER_TWO_HOURS_AGO = 'AFTER_TWO_HOURS_AGO',
  CUSTOM = 'CUSTOM'
}
export const RECEIVED_AT_PERIOD_LABEL: Record<ReceivedAtPeriod, string> = {
  AFTER_TWO_HOURS_AGO: 'Arrivée estimée dans moins de 2h',
  AFTER_FOUR_HOURS_AGO: 'Arrivée estimée dans moins de 4h',
  AFTER_HEIGTH_HOURS_AGO: 'Arrivée estimée dans moins de 8h',
  AFTER_TWELVE_HOURS_AGO: 'Arrivée estimée dans moins de 12h',
  AFTER_ONE_DAY_AGO: 'Arrivée estimée dans moins de 24h',
  CUSTOM: 'Période spécifique'
}
export const RECEIVED_AT_PERIODS_AS_OPTIONS = getOptionsFromLabelledEnum(RECEIVED_AT_PERIOD_LABEL)
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const FAKE_PRIOR_NOTIFICATIONS: PriorNotification.PriorNotification[] = [
  {
    alertCount: 2,
    estimatedTimeOfArrival: '2024-03-01T03:00:00Z',
    facade: SeaFrontGroup.MED,
    fleetSegments: [
      {
        bycatchSpecies: [],
        dirm: [],
        faoAreas: [],
        gears: [],
        impactRiskFactor: 0.0,
        segment: 'SEG01',
        segmentName: 'Segment 1',
        targetSpecies: [],
        year: 2024
      }
    ],
    id: 1,
    isSubmitted: false,
    port: {
      latitude: 0.0,
      locode: 'POR01',
      longitude: 0.0,
      name: 'Port 1'
    },
    reason: PriorNotification.PriorNotificationReason.LANDING,
    receivedAt: '2024-03-01T02:00:00Z',
    scheduledTimeOfLanding: '2024-03-01T04:00:00Z',
    types: [PriorNotification.PriorNotificationType.DEEP_SEA_SPECIES],
    vessel: {
      beaconNumber: null,
      declaredFishingGears: [],
      district: '',
      districtCode: '',
      externalReferenceNumber: 'ABC1234',
      flagState: '',
      gauge: 0,
      imo: '',
      internalReferenceNumber: 'FR000123',
      ircs: 'ABCDEF',
      length: 16.89,
      mmsi: '123 456 789',
      navigationLicenceExpirationDate: '',
      operatorEmails: [],
      operatorName: '',
      operatorPhones: [],
      pinger: true,
      power: 0,
      proprietorEmails: [],
      proprietorName: '',
      proprietorPhones: [],
      registryPort: '',
      riskFactor: {
        controlPriorityLevel: 0,
        controlRateRiskFactor: 0,
        detectabilityRiskFactor: 0,
        gearOnboard: undefined,
        impactRiskFactor: 0,
        lastControlDatetime: '2023-01-05T19:52:00Z',
        numberControlsLastFiveYears: 0,
        numberControlsLastThreeYears: 0,
        numberGearSeizuresLastFiveYears: 0,
        numberInfractionsLastFiveYears: 0,
        numberSpeciesSeizuresLastFiveYears: 0,
        numberVesselSeizuresLastFiveYears: 0,
        probabilityRiskFactor: 0,
        riskFactor: 3.1,
        segmentHighestImpact: '',
        segmentHighestPriority: '',
        segments: [],
        speciesOnboard: undefined
      },
      sailingCategory: '',
      sailingType: '',
      underCharter: false,
      vesselEmails: [],
      vesselId: 1,
      vesselName: 'Vessel 1',
      vesselPhones: [],
      vesselType: '',
      width: 0
    }
  },
  {
    alertCount: 2,
    estimatedTimeOfArrival: '2024-03-01T03:00:00Z',
    facade: SeaFrontGroup.NAMO,
    fleetSegments: [
      {
        bycatchSpecies: [],
        dirm: [],
        faoAreas: [],
        gears: [],
        impactRiskFactor: 0.0,
        segment: 'SEG02',
        segmentName: 'Segment 2',
        targetSpecies: [],
        year: 2024
      },
      {
        bycatchSpecies: [],
        dirm: [],
        faoAreas: [],
        gears: [],
        impactRiskFactor: 0.0,
        segment: 'SEG03',
        segmentName: 'Segment 3',
        targetSpecies: [],
        year: 2024
      }
    ],
    id: 2,
    isSubmitted: false,
    port: {
      latitude: 0.0,
      locode: 'POR02',
      longitude: 0.0,
      name: 'Port 2'
    },
    reason: PriorNotification.PriorNotificationReason.LANDING,
    receivedAt: '2024-03-01T02:00:00Z',
    scheduledTimeOfLanding: '2024-03-01T04:00:00Z',
    types: [PriorNotification.PriorNotificationType.DEEP_SEA_SPECIES],
    vessel: {
      beaconNumber: null,
      declaredFishingGears: [],
      district: '',
      districtCode: '',
      externalReferenceNumber: 'DEF5678',
      flagState: '',
      gauge: 0,
      imo: '',
      internalReferenceNumber: 'FR000456',
      ircs: 'GHIJK',
      length: 24.6,
      mmsi: '987 654 321',
      navigationLicenceExpirationDate: '',
      operatorEmails: [],
      operatorName: '',
      operatorPhones: [],
      pinger: true,
      power: 0,
      proprietorEmails: [],
      proprietorName: '',
      proprietorPhones: [],
      registryPort: '',
      riskFactor: {
        controlPriorityLevel: 0,
        controlRateRiskFactor: 0,
        detectabilityRiskFactor: 0,
        gearOnboard: undefined,
        impactRiskFactor: 0,
        lastControlDatetime: '2024-02-18T14:12:00Z',
        numberControlsLastFiveYears: 0,
        numberControlsLastThreeYears: 0,
        numberGearSeizuresLastFiveYears: 0,
        numberInfractionsLastFiveYears: 0,
        numberSpeciesSeizuresLastFiveYears: 0,
        numberVesselSeizuresLastFiveYears: 0,
        probabilityRiskFactor: 0,
        riskFactor: 2.4,
        segmentHighestImpact: '',
        segmentHighestPriority: '',
        segments: [],
        speciesOnboard: undefined
      },
      sailingCategory: '',
      sailingType: '',
      underCharter: false,
      vesselEmails: [],
      vesselId: 2,
      vesselName: 'Vessel 2',
      vesselPhones: [],
      vesselType: '',
      width: 0
    }
  }
]
