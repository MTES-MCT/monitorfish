import { Ellipsised } from '@components/Ellipsised'
import { Titled } from '@components/Titled'
import { Logbook } from '@features/Logbook/Logbook.types'
import { customDayjs, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'

import { ActionButtonsCell } from './cells/ActionButtonsCell'
import { StateCell } from './cells/StateCell'
import { TypesCell } from './cells/TypesCell'
import { None, StyledCountryFlag } from './styles'
import { VesselRiskFactor } from '../../../Vessel/components/VesselRiskFactor'
import { PriorNotification } from '../../PriorNotification.types'

import type { CellContext, ColumnDef } from '@tanstack/react-table'

export function getTableColumns(isFromUrl: boolean): Array<ColumnDef<PriorNotification.PriorNotification, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0

  return [
    {
      accessorFn: row => row.reportId,
      cell: ({ row }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      header: ({ table }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      id: 'select',
      size: 25 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.expectedArrivalDate,
      cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => {
        const expectedArrivalDate = info.getValue()

        return expectedArrivalDate ? customDayjs(expectedArrivalDate).utc().format('DD/MM/YYYY à HH[h]mm') : '-'
      },
      enableSorting: true,
      header: () => 'Arrivée estimée',
      id: Logbook.ApiSortColumn.EXPECTED_ARRIVAL_DATE,
      size: 160 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.expectedLandingDate,
      cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => {
        const expectedLandingDate = info.getValue()

        return expectedLandingDate ? customDayjs(expectedLandingDate).utc().format('DD/MM/YYYY à HH[h]mm') : '-'
      },
      enableSorting: true,
      header: () => 'Débarque prévue',
      id: Logbook.ApiSortColumn.EXPECTED_LANDING_DATE,
      size: 160 + legacyFirefoxOffset
    },
    {
      accessorFn: row => (!!row.portLocode && !!row.portName ? `${row.portName} (${row.portLocode})` : '-'),
      cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
        <Ellipsised>{info.getValue()}</Ellipsised>
      ),
      enableSorting: true,
      header: () => "Port d'arrivée",
      id: Logbook.ApiSortColumn.PORT_NAME,
      size: 192 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.riskFactor,
      cell: (info: CellContext<PriorNotification.PriorNotification, number | undefined>) => {
        const priorNotification = info.row.original

        return (
          <VesselRiskFactor
            hasVesselRiskFactorSegments={false}
            isVesselUnderCharter={priorNotification.isVesselUnderCharter}
            vesselLastControlDateTime={priorNotification.vesselLastControlDateTime}
            vesselRiskFactor={priorNotification.riskFactor}
          />
        )
      },
      enableSorting: true,
      header: () => 'Note',
      id: Logbook.ApiSortColumn.VESSEL_RISK_FACTOR,
      size: 95 + legacyFirefoxOffset
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
      id: Logbook.ApiSortColumn.VESSEL_NAME,
      size: 204 + legacyFirefoxOffset
    },
    {
      accessorFn: row =>
        row.tripSegments.length > 0 ? row.tripSegments.map(tripSegment => tripSegment.code).join(', ') : undefined,
      cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) =>
        info.getValue() ? <Ellipsised>{info.getValue()}</Ellipsised> : <None>Aucun segment</None>,
      enableSorting: false,
      header: () => 'Segments',
      id: 'tripSegments',
      size: 168 + legacyFirefoxOffset
    },
    {
      // accessorFn: row =>
      //   row.types.length > 0
      //     ? sortPriorNotificationTypesByPriority(row.types.map(({ name }) => name)).join(', ')
      //     : undefined,
      cell: (info: CellContext<PriorNotification.PriorNotification, string | undefined>) => (
        <TypesCell priorNotification={info.row.original} />
      ),
      enableSorting: false,
      header: () => 'Types de préavis',
      id: 'types',
      size: 244 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.state,
      cell: (info: CellContext<PriorNotification.PriorNotification, PriorNotification.State>) => (
        <StateCell isInvalidated={info.row.original.isInvalidated} state={info.getValue()} />
      ),
      enableSorting: false,
      header: () => '',
      id: 'state',
      size: 55 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.reportId,
      cell: (info: CellContext<PriorNotification.PriorNotification, string>) => (
        <ActionButtonsCell priorNotification={info.row.original} />
      ),
      enableSorting: false,
      header: () => '',
      id: 'actions',
      size: 88 + legacyFirefoxOffset
    }
  ]
}
