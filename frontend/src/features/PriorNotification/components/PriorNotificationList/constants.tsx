import { Ellipsised } from '@components/Ellipsised'
import { customDayjs, THEME, Tag, getOptionsFromLabelledEnum, TableWithSelectableRows } from '@mtes-mct/monitor-ui'

import { ButtonsGroupRow } from './ButtonsGroupRow'
import { SeaFrontGroup, type NoSeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
import { VesselRiskFactor } from '../../../Vessel/components/VesselRiskFactor'
import { PriorNotification } from '../../PriorNotification.types'

import type { CellContext, ColumnDef } from '@tanstack/react-table'

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
    accessorFn: row => row.expectedArrivalDate,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => {
      const expectedArrivalDate = info.getValue()

      return expectedArrivalDate ? customDayjs(expectedArrivalDate).utc().format('DD/MM/YYYY à HH[h]mm') : '-'
    },
    enableSorting: true,
    header: () => 'Arrivée estimée',
    id: 'estimatedTimeOfArrival',
    size: 130
  },
  {
    accessorFn: row => row.expectedLandingDate,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => {
      const expectedLandingDate = info.getValue()

      return expectedLandingDate ? customDayjs(expectedLandingDate).utc().format('DD/MM/YYYY à HH[h]mm') : '-'
    },
    enableSorting: true,
    header: () => 'Débarque prévue',
    id: 'scheduledTimeOfLanding',
    size: 120
  },
  {
    accessorFn: row => (!!row.portLocode && !!row.portName ? `${row.portName} (${row.portLocode})` : '-'),
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
      <Ellipsised>{info.getValue()}</Ellipsised>
    ),
    enableSorting: true,
    header: () => "Port d'arrivée",
    id: 'port',
    size: 180
  },
  {
    accessorFn: row => row.vesselRiskFactor,
    cell: (info: CellContext<PriorNotification.PriorNotification, number | undefined>) => {
      const priorNotification = info.row.original

      return (
        <VesselRiskFactor
          // TODO Check if making it always `true` is a valid assumption.
          hasSegments
          isVesselUnderCharter={priorNotification.isVesselUnderCharter}
          vesselLastControlDate={priorNotification.vesselLastControlDate}
          vesselRiskFactor={priorNotification.vesselRiskFactor}
          vesselRiskFactorDetectability={priorNotification.vesselRiskFactorDetectability}
          vesselRiskFactorImpact={priorNotification.vesselRiskFactorImpact}
          vesselRiskFactorProbability={priorNotification.vesselRiskFactorProbability}
        />
      )
    },
    enableSorting: true,
    header: () => 'Note',
    id: 'riskFactor.riskFactor',
    size: 50
  },
  {
    accessorFn: row => row.vesselName ?? '-',
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
      <Ellipsised>{info.getValue()}</Ellipsised>
    ),
    enableSorting: true,
    header: () => 'Nom',
    id: 'vessel.vesselName',
    size: 160
  },
  {
    accessorFn: row =>
      row.tripSegments.length > 0 ? row.tripSegments.map(tripSegment => tripSegment.code).join('/') : '-',
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
      <Ellipsised>{info.getValue()}</Ellipsised>
    ),
    enableSorting: true,
    header: () => 'Segments',
    id: 'fleetSegments',
    size: 130
  },
  {
    accessorFn: row => (row.types.length > 0 ? row.types.map(({ name }) => name).join(', ') : '-'),
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
      <Ellipsised>{info.getValue()}</Ellipsised>
    ),
    enableSorting: true,
    header: () => 'Types de préavis',
    id: 'types',
    size: 180
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

/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
export const SUB_MENU_LABEL: Record<SeaFrontGroup | NoSeaFrontGroup, string> = {
  ALL: 'Vue d’ensemble',
  MED: 'MED',
  MEMN: 'MEMN',
  NAMO: 'NAMO',
  SA: 'SA',
  OUTREMEROA: 'OUTRE-MER OA',
  OUTREMEROI: 'OUTRE-MER OI',
  NO_SEA_FRONT_GROUP: 'HORS FAÇADE'
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

export enum ExpectedArrivalPeriod {
  IN_LESS_THAN_TWO_HOURS = 'IN_LESS_THAN_TWO_HOURS',
  IN_LESS_THAN_FOUR_HOURS = 'IN_LESS_THAN_FOUR_HOURS',
  IN_LESS_THAN_EIGTH_HOURS = 'IN_LESS_THAN_EIGTH_HOURS',
  IN_LESS_THAN_TWELVE_HOURS = 'IN_LESS_THAN_TWELVE_HOURS',
  IN_LESS_THAN_ONE_DAY = 'IN_LESS_THAN_ONE_DAY',
  CUSTOM = 'CUSTOM'
}
export const EXPECTED_ARRIVAL_PERIOD_LABEL: Record<ExpectedArrivalPeriod, string> = {
  IN_LESS_THAN_TWO_HOURS: 'Arrivée estimée dans moins de 2h',
  IN_LESS_THAN_FOUR_HOURS: 'Arrivée estimée dans moins de 4h',
  IN_LESS_THAN_EIGTH_HOURS: 'Arrivée estimée dans moins de 8h',
  IN_LESS_THAN_TWELVE_HOURS: 'Arrivée estimée dans moins de 12h',
  IN_LESS_THAN_ONE_DAY: 'Arrivée estimée dans moins de 24h',
  CUSTOM: 'Période spécifique'
}
export const EXPECTED_ARRIVAL_PERIODS_AS_OPTIONS = getOptionsFromLabelledEnum(EXPECTED_ARRIVAL_PERIOD_LABEL)
/* eslint-enable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
