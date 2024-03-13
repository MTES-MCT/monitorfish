import { customDayjs, THEME, Tag, getOptionsFromLabelledEnum, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { capitalizeFirstLetter } from '@utils/capitalizeFirstLetter'

import { ButtonsGroupRow } from './ButtonsGroupRow'
import { VesselRiskFactor } from './VesselRiskFactor'
import { SeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
import { PriorNotification } from '../../PriorNotification.types'

import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { RiskFactor } from 'domain/entities/vessel/riskFactor/types'

export const PRIOR_NOTIFICATION_TABLE_COLUMNS: Array<ColumnDef<PriorNotification.PriorNotification, any>> = [
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
    accessorFn: row => row.logbookMessage?.message?.predictedArrivalDatetimeUtc,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => {
      const predictedArrivalDatetimeUtc = info.getValue()

      return predictedArrivalDatetimeUtc
        ? customDayjs(predictedArrivalDatetimeUtc).utc().format('DD/MM/YYYY à HH[h]mm')
        : '-'
    },
    enableSorting: true,
    header: () => 'Arrivée estimée',
    id: 'estimatedTimeOfArrival',
    size: 120
  },
  {
    accessorFn: row => row.logbookMessage?.message?.predictedLandingDatetimeUtc,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => {
      const predictedLandingDatetimeUtc = info.getValue()

      return predictedLandingDatetimeUtc
        ? customDayjs(predictedLandingDatetimeUtc).utc().format('DD/MM/YYYY à HH[h]mm')
        : '-'
    },
    enableSorting: true,
    header: () => 'Débarque prévue',
    id: 'scheduledTimeOfLanding',
    size: 120
  },
  {
    accessorFn: row => (row.port ? `${row.port.name} (${row.port.locode})` : undefined),
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => info.getValue() ?? '-',
    enableSorting: true,
    header: () => "Port d'arrivée",
    id: 'port',
    size: 180
  },
  {
    accessorFn: row => row.vesselRiskFactor,
    cell: (info: CellContext<PriorNotification.PriorNotification, RiskFactor | undefined>) => (
      <VesselRiskFactor vesselRiskFactor={info.getValue()} />
    ),
    enableSorting: true,
    header: () => 'Note',
    id: 'riskFactor.riskFactor',
    size: 50
  },
  {
    accessorFn: row => row.vessel?.vesselName,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => info.getValue() ?? '-',
    enableSorting: true,
    header: () => 'Nom',
    id: 'vessel.vesselName',
    size: 160
  },
  {
    accessorFn: row => row.tripSegments.map(tripSegment => tripSegment.segment).join('/'),
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => {
      const segmentsAsText = info.getValue()

      return segmentsAsText.length > 0 ? segmentsAsText : '-'
    },
    enableSorting: true,
    header: () => 'Segments',
    id: 'fleetSegments',
    size: 130
  },
  {
    // accessorFn: row => row.types.map(type => PriorNotification.PRIOR_NOTIFICATION_TYPE_LABEL[type]).join(', '),
    accessorFn: () => PriorNotification.PRIOR_NOTIFICATION_TYPE_LABEL.NOT_APPLICABLE,
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) =>
      capitalizeFirstLetter(info.getValue() as string),
    enableSorting: true,
    header: () => 'Types de préavis',
    id: 'types',
    size: 170
  },
  {
    accessorFn: row => row.reportingsCount,
    cell: (info: CellContext<PriorNotification.PriorNotification, number>) => {
      const alertCount = info.getValue()
      if (alertCount === 0) {
        return null
      }

      return <Tag backgroundColor={THEME.color.maximumRed15} style={{ marginTop: 1 }}>{`${info.getValue()} sign.`}</Tag>
    },
    enableSorting: false,
    header: () => '',
    id: 'alertCount',
    size: 60
  },
  {
    accessorFn: row => row.id,
    cell: (info: CellContext<PriorNotification.PriorNotification, number>) => <ButtonsGroupRow id={info.getValue()} />,
    enableSorting: false,
    header: () => '',
    id: 'actions',
    size: 56
  }
]

export const PRIOR_NOTIFICATION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(
  PriorNotification.PRIOR_NOTIFICATION_TYPE_LABEL
)

/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
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
  AFTER_TWO_HOURS_AGO = 'AFTER_TWO_HOURS_AGO',
  AFTER_FOUR_HOURS_AGO = 'AFTER_FOUR_HOURS_AGO',
  AFTER_EIGTH_HOURS_AGO = 'AFTER_EIGTH_HOURS_AGO',
  AFTER_TWELVE_HOURS_AGO = 'AFTER_TWELVE_HOURS_AGO',
  AFTER_ONE_DAY_AGO = 'AFTER_ONE_DAY_AGO',
  CUSTOM = 'CUSTOM'
}
export const RECEIVED_AT_PERIOD_LABEL: Record<ReceivedAtPeriod, string> = {
  AFTER_TWO_HOURS_AGO: 'Arrivée estimée dans moins de 2h',
  AFTER_FOUR_HOURS_AGO: 'Arrivée estimée dans moins de 4h',
  AFTER_EIGTH_HOURS_AGO: 'Arrivée estimée dans moins de 8h',
  AFTER_TWELVE_HOURS_AGO: 'Arrivée estimée dans moins de 12h',
  AFTER_ONE_DAY_AGO: 'Arrivée estimée dans moins de 24h',
  CUSTOM: 'Période spécifique'
}
export const RECEIVED_AT_PERIODS_AS_OPTIONS = getOptionsFromLabelledEnum(RECEIVED_AT_PERIOD_LABEL)
/* eslint-enable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
