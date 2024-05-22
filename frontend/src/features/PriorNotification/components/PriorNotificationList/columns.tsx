import { Ellipsised } from '@components/Ellipsised'
import { Titled } from '@components/Titled'
import { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import { customDayjs, THEME, Tag, TableWithSelectableRows } from '@mtes-mct/monitor-ui'

import { ButtonsGroupRow } from './ButtonsGroupRow'
import { None, StyledCountryFlag } from './styles'
import { sortPriorNotificationTypesByPriority } from './utils'
import { VesselRiskFactor } from '../../../Vessel/components/VesselRiskFactor'
import { PriorNotification } from '../../PriorNotification.types'

import type { CellContext, ColumnDef } from '@tanstack/react-table'

export const TABLE_COLUMNS: Array<ColumnDef<PriorNotification.PriorNotification, any>> = [
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
    size: 40
  },
  {
    accessorFn: row => row.expectedArrivalDate,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => {
      const expectedArrivalDate = info.getValue()

      return expectedArrivalDate ? customDayjs(expectedArrivalDate).utc().format('DD/MM/YYYY à HH[h]mm') : '-'
    },
    enableSorting: true,
    header: () => 'Arrivée estimée',
    id: LogbookMessage.ApiSortColumn.EXPECTED_ARRIVAL_DATE,
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
    id: LogbookMessage.ApiSortColumn.EXPECTED_LANDING_DATE,
    size: 120
  },
  {
    accessorFn: row => (!!row.portLocode && !!row.portName ? `${row.portName} (${row.portLocode})` : '-'),
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
      <Ellipsised>{info.getValue()}</Ellipsised>
    ),
    enableSorting: true,
    header: () => "Port d'arrivée",
    id: LogbookMessage.ApiSortColumn.PORT_NAME,
    size: 140
  },
  {
    accessorFn: row => row.vesselRiskFactor,
    cell: (info: CellContext<PriorNotification.PriorNotification, number | undefined>) => {
      const priorNotification = info.row.original

      return (
        <VesselRiskFactor
          hasVesselRiskFactorSegments={priorNotification.hasVesselRiskFactorSegments}
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
    id: LogbookMessage.ApiSortColumn.VESSEL_RISK_FACTOR,
    size: 50
  },
  {
    accessorFn: row => row.vesselName ?? (row.vesselId === -1 ? 'Navire inconnu' : '-'),
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => {
      const priorNotification = info.row.original

      return (
        <Ellipsised>
          <StyledCountryFlag countryCode={priorNotification.vesselFlagCountryCode} size={[20, 14]} />
          <Titled>{info.getValue()}</Titled>
        </Ellipsised>
      )
    },
    enableSorting: true,
    header: () => 'Nom',
    id: LogbookMessage.ApiSortColumn.VESSEL_NAME,
    size: 160
  },
  {
    accessorFn: row =>
      row.tripSegments.length > 0 ? row.tripSegments.map(tripSegment => tripSegment.code).join(', ') : undefined,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) =>
      info.getValue() ? <Ellipsised>{info.getValue()}</Ellipsised> : <None>Aucun segment</None>,
    enableSorting: false,
    header: () => 'Segments',
    id: 'tripSegments',
    size: 130
  },
  {
    accessorFn: row =>
      row.types.length > 0
        ? sortPriorNotificationTypesByPriority(row.types.map(({ name }) => name)).join(', ')
        : undefined,
    cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) =>
      info.getValue() ? <Ellipsised>{info.getValue()}</Ellipsised> : <None>Aucun type</None>,
    enableSorting: false,
    header: () => 'Types de préavis',
    id: 'types',
    size: 200
  },
  {
    accessorFn: row => row.reportingsCount,
    cell: (info: CellContext<PriorNotification.PriorNotification, number>) => {
      const alertCount = info.getValue()
      if (alertCount === 0) {
        return null
      }

      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tag
            backgroundColor={THEME.color.maximumRed15}
            style={{ marginTop: 1 }}
            title={`${info.getValue()} signalements`}
          >{`${info.getValue()} sign.`}</Tag>
        </div>
      )
    },
    enableSorting: false,
    header: () => '',
    id: 'alertCount',
    size: 72
  },
  {
    accessorFn: row => row.id,
    cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
      <ButtonsGroupRow priorNotification={info.row.original} />
    ),
    enableSorting: false,
    header: () => '',
    id: 'actions',
    size: 64
  }
]
