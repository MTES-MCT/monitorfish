import { CountryFlag } from '@components/CountryFlag'
import { Ellipsised } from '@components/Ellipsised'
import { Titled } from '@components/Titled'
import { HiddenText } from '@features/commonStyles/HiddenText'
import { getInfractionTitle } from '@features/Reporting/components/ReportingCard/utils'
import { getReportingOrigin, getReportingTitle } from '@features/Reporting/components/ReportingTable/utils'
import { type Reporting, ReportingsSortColumn, ReportingTypeCharacteristics } from '@features/Reporting/types'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { Accent, Tag, TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import dayjs from 'dayjs'
import styled from 'styled-components'

import { ActionButtonsCell } from './cells/ActionButtonsCell'

import type { CellContext, ColumnDef } from '@tanstack/react-table'

/**
 * Sortable columns are identified by their backend sort column, as `useListSorting` sends the
 * `react-table` column id straight to the API.
 */
export function getReportingTableColumns(isFromUrl: boolean): Array<ColumnDef<Reporting.Reporting, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0

  return [
    {
      accessorFn: row => row.id,
      cell: ({ getValue, row }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        >
          <HiddenText>{`Sélectionner le signalement ${getValue()}`}</HiddenText>
        </TableWithSelectableRows.RowCheckbox>
      ),
      enableSorting: false,
      header: ({ table }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        >
          <HiddenText>Sélectionner tous les signalements</HiddenText>
        </TableWithSelectableRows.RowCheckbox>
      ),
      id: 'select',
      size: 25 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.reportingDate ?? row.validationDate ?? row.creationDate,
      cell: (info: CellContext<Reporting.Reporting, string | undefined>) => {
        const reportingDate = info.getValue()

        return reportingDate ? dayjs(reportingDate).format('DD/MM/YYYY') : ''
      },
      enableSorting: true,
      header: () => 'Date début',
      id: ReportingsSortColumn.REPORTING_DATE,
      size: 100 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row,
      cell: (info: CellContext<Reporting.Reporting, Reporting.Reporting>) => {
        const reporting = info.getValue()

        return <Ellipsised>{getReportingOrigin(reporting)}</Ellipsised>
      },
      enableSorting: true,
      header: () => 'Source',
      id: ReportingsSortColumn.ORIGIN,
      size: 132 + legacyFirefoxOffset
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
      id: ReportingsSortColumn.VESSEL_NAME,
      size: 280 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.type,
      cell: (info: CellContext<Reporting.Reporting, ReportingType>) => {
        const { isInfractionSuspicion } = ReportingTypeCharacteristics[info.getValue()]
        const typeLabel = isInfractionSuspicion ? "Susp. d'infraction" : 'Observation'

        return (
          <TypeAndStatus>
            <TypeDot $isInfractionSuspicion={isInfractionSuspicion} title={typeLabel} />
            <HiddenText>{typeLabel}</HiddenText>
            {info.row.original.isArchived ? 'Archivé' : 'En cours'}
          </TypeAndStatus>
        )
      },
      enableSorting: true,
      header: () => 'Type et statut',
      id: ReportingsSortColumn.TYPE,
      size: 140 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row,
      cell: (info: CellContext<Reporting.Reporting, Reporting.Reporting>) => {
        const reporting = info.getValue()

        return (
          <TitleCell>
            {reporting.isIUU && <Tag accent={Accent.PRIMARY}>INN</Tag>}
            <Ellipsised>{getReportingTitle(reporting)}</Ellipsised>
          </TitleCell>
        )
      },
      enableSorting: true,
      header: () => 'Titre',
      id: ReportingsSortColumn.TITLE,
      size: 315 + legacyFirefoxOffset
    },
    {
      accessorFn: row => {
        if (row.type === ReportingType.INFRACTION_SUSPICION) {
          return row.value.infractions.map((i: any) => i.natinfCode).join(', ')
        }
        if (row.type === ReportingType.ALERT) {
          return row.value.natinfCode
        }

        return ''
      },
      cell: ({ row }: CellContext<Reporting.Reporting, string>) => {
        const reporting = row.original

        if (reporting.type === ReportingType.INFRACTION_SUSPICION) {
          return (
            <Ellipsised title={getInfractionTitle(reporting)}>
              {reporting.value.infractions.length === 1
                ? `${reporting.value.infractions[0]?.threatCharacterization} / NATINF ${reporting.value.infractions[0]?.natinfCode}`
                : `${reporting.value.infractions.length} infractions`}
            </Ellipsised>
          )
        }

        if (reporting.type === ReportingType.ALERT) {
          return (
            <Ellipsised title={getInfractionTitle(reporting)}>
              {reporting.value.threatCharacterization} / NATINF {reporting.value.natinfCode}
            </Ellipsised>
          )
        }

        return undefined
      },
      enableSorting: true,
      header: () => 'Type d’infraction',
      id: ReportingsSortColumn.THREAT,
      size: 210
    },
    {
      accessorFn: row => row.id,
      cell: (info: CellContext<Reporting.Reporting, number>) => <ActionButtonsCell reporting={info.row.original} />,
      enableSorting: false,
      header: () => '',
      id: 'actions',
      size: 88 + legacyFirefoxOffset
    }
  ]
}

export const StyledCountryFlag = styled(CountryFlag)`
  margin-right: 8px;
  vertical-align: -2px;
`

const TypeAndStatus = styled.span`
  align-items: center;
  display: flex;
`

const TypeDot = styled.span<{
  $isInfractionSuspicion: boolean
}>`
  background-color: ${p => (p.$isInfractionSuspicion ? p.theme.color.maximumRed : p.theme.color.opal)};
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  height: 8px;
  margin-right: 8px;
  width: 8px;
`

const TitleCell = styled.span`
  align-items: center;
  display: flex;
  gap: 8px;
  overflow: hidden;
`
