import { CountryFlag } from '@components/CountryFlag'
import { Ellipsised } from '@components/Ellipsised'
import { Titled } from '@components/Titled'
import { getReportingOrigin, getReportingTitle } from '@features/Reporting/components/ReportingTable/utils'
import { type Reporting, ReportingType, ReportingTypeCharacteristics } from '@features/Reporting/types'
import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { ActionButtonsCell } from './cells/ActionButtonsCell'

import type { CellContext, ColumnDef } from '@tanstack/react-table'

export function getReportingTableColumns(isFromUrl: boolean): Array<ColumnDef<Reporting.Reporting, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0

  return [
    {
      accessorFn: row => row.id,
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
      accessorFn: row => row.validationDate ?? row.creationDate,
      cell: (info: CellContext<Reporting.Reporting, string | undefined>) => {
        const validationDate = info.getValue()
        if (!validationDate) {
          return undefined
        }

        return timeago.format(validationDate, 'fr').replace('il y a ', '')
      },
      enableSorting: true,
      header: () => 'Ouvert il y a...',
      id: 'date',
      size: 130 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row,
      cell: (info: CellContext<Reporting.Reporting, Reporting.Reporting>) => {
        const reporting = info.getValue()

        return getReportingOrigin(reporting)
      },
      enableSorting: true,
      header: () => 'Origine',
      id: 'origin',
      size: 130 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.type,
      cell: (info: CellContext<Reporting.Reporting, string>) => {
        const reportingType = info.getValue()
        const { isInfractionSuspicion } = ReportingTypeCharacteristics[reportingType]

        if (isInfractionSuspicion) {
          return "Susp. d'infraction"
        }

        return 'Observation'
      },
      enableSorting: true,
      header: () => 'Type',
      id: 'type',
      size: 130 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row,
      cell: (info: CellContext<Reporting.Reporting, Reporting.Reporting>) => {
        const reporting = info.getValue()

        return <Ellipsised>{getReportingTitle(reporting)}</Ellipsised>
      },
      enableSorting: true,
      header: () => 'Titre',
      id: 'title',
      size: 280 + legacyFirefoxOffset
    },
    {
      accessorFn: row =>
        row.type === ReportingType.INFRACTION_SUSPICION || row.type === ReportingType.ALERT
          ? row.value.natinfCode
          : undefined,
      cell: (info: CellContext<Reporting.Reporting, string | undefined>) => info.getValue(),
      enableSorting: true,
      header: () => 'NATINF',
      id: 'natinfCode',
      size: 85 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.vesselName ?? (row.vesselId === -1 ? 'Navire inconnu' : '-'),
      cell: (info: CellContext<Reporting.Reporting, string>) => {
        const reporting = info.row.original

        return (
          <Ellipsised>
            <StyledCountryFlag countryCode={reporting.flagState} size={[20, 14]} />
            <Titled>{info.getValue()}</Titled>
          </Ellipsised>
        )
      },
      enableSorting: true,
      header: () => 'Navire',
      id: 'vesselName',
      size: 230 + legacyFirefoxOffset
    },
    {
      accessorFn: row =>
        row.type === ReportingType.INFRACTION_SUSPICION || row.type === ReportingType.ALERT ? row.value.dml : undefined,
      cell: (info: CellContext<Reporting.Reporting, string | undefined>) => info.getValue(),
      enableSorting: true,
      header: () => 'DML',
      id: 'dml',
      size: 70 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.underCharter,
      cell: (info: CellContext<Reporting.Reporting, boolean>) => info.getValue(),
      enableSorting: true,
      header: () => '',
      id: 'underCharter',
      size: 55 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.id,
      cell: (info: CellContext<Reporting.Reporting, number>) => <ActionButtonsCell reporting={info.row.original} />,
      enableSorting: false,
      header: () => '',
      id: 'actions',
      size: 73 + legacyFirefoxOffset
    }
  ]
}

export const StyledCountryFlag = styled(CountryFlag)`
  margin-right: 8px;
  vertical-align: -2px;
`
