import { Ellipsised } from '@components/Ellipsised'
import { Titled } from '@components/Titled'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs, TableWithSelectableRows, Tag, THEME } from '@mtes-mct/monitor-ui'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'

import { ActionButtonsCell } from './cells/ActionButtonsCell'
import { None, StyledCountryFlag } from './styles'
import { VesselRiskFactor } from '../../../RiskFactor/components/VesselRiskFactor'

import type { CellContext, ColumnDef } from '@tanstack/react-table'

export function getTableColumns(
  isFromUrl: boolean,
  actionColumn: ColumnDef<Vessel.VesselLastPosition, any>
): Array<ColumnDef<Vessel.VesselLastPosition, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0
  const actionColumnWithOffset = { ...actionColumn, size: (actionColumn.size ?? 60) + legacyFirefoxOffset }

  return [
    {
      accessorFn: row => row.vesselFeatureId,
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
      accessorFn: row => row.riskFactor,
      cell: (info: CellContext<Vessel.VesselLastPosition, number | undefined>) => {
        const vessel = info.row.original

        return (
          <VesselRiskFactor
            hasVesselRiskFactorSegments={false}
            isVesselUnderCharter={vessel.underCharter}
            vesselLastControlDateTime={vessel.lastControlDateTime}
            vesselRiskFactor={vessel.riskFactor}
          />
        )
      },
      enableSorting: true,
      header: () => 'Ndr',
      id: 'riskFactor',
      size: 75 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.vesselName ?? (row.vesselId === -1 ? 'Navire inconnu' : '-'),
      cell: (info: CellContext<Vessel.VesselLastPosition, string>) => {
        const priorNotification = info.row.original

        return (
          <Ellipsised>
            <StyledCountryFlag countryCode={priorNotification.flagState} size={[20, 14]} />
            <Titled>{info.getValue()}</Titled>
          </Ellipsised>
        )
      },
      enableSorting: true,
      header: () => 'Navire',
      id: 'vesselName',
      size: 244 + legacyFirefoxOffset
    },
    {
      accessorFn: row =>
        row.segments.length > 0 ? row.segments.map(tripSegment => tripSegment).join(', ') : undefined,
      cell: (info: CellContext<Vessel.VesselLastPosition, string | undefined>) =>
        info.getValue() ? <Ellipsised>{info.getValue()}</Ellipsised> : <None>Aucun segment</None>,
      enableSorting: true,
      header: () => 'Segments',
      id: 'segments',
      size: 168 + legacyFirefoxOffset
    },
    {
      accessorFn: row => (row.gearsArray.length > 0 ? row.gearsArray.join(', ') : undefined),
      cell: (info: CellContext<Vessel.VesselLastPosition, string | undefined>) =>
        info.getValue() ? <Ellipsised>{info.getValue()}</Ellipsised> : <None>Aucun engin</None>,
      enableSorting: false,
      header: () => 'Engins',
      id: 'gears',
      size: 204 + legacyFirefoxOffset
    },
    {
      accessorFn: row => (row.speciesArray.length > 0 ? row.speciesArray.join(', ') : undefined),
      cell: (info: CellContext<Vessel.VesselLastPosition, string | undefined>) =>
        info.getValue() ? (
          <Ellipsised>{info.getValue()}</Ellipsised>
        ) : (
          <None>Le navire n&apos;a pas encore fait de FAR</None>
        ),
      enableSorting: false,
      header: () => 'Espèces',
      id: 'species',
      size: 274 + legacyFirefoxOffset
    },
    {
      accessorKey: 'lastControlDateTime',
      cell: (info: CellContext<Vessel.VesselLastPosition, string | undefined>) =>
        info.getValue() ? customDayjs(info.getValue()).utc().format('[Le] DD/MM/YYYY') : <None>-</None>,
      enableSorting: true,
      header: () => 'Dernier contrôle',
      id: 'lastControlDateTime',
      size: 204 + legacyFirefoxOffset
    },
    {
      accessorKey: 'hasInfractionSuspicion',
      cell: (info: CellContext<Vessel.VesselLastPosition, boolean>) =>
        info.getValue() ? (
          <Tag backgroundColor={THEME.color.maximumRed15} color={THEME.color.maximumRed}>
            Signalement(s)
          </Tag>
        ) : (
          ''
        ),
      enableSorting: true,
      header: () => 'Signalements',
      id: 'hasInfractionSuspicion',
      size: 184 + legacyFirefoxOffset
    },
    actionColumnWithOffset
  ]
}

export const vesselListActionColumn: ColumnDef<Vessel.VesselLastPosition, any> = {
  accessorFn: row => row.vesselFeatureId,
  cell: (info: CellContext<Vessel.VesselLastPosition, string>) => <ActionButtonsCell vessel={info.row.original} />,
  enableSorting: false,
  header: () => '',
  id: 'actions',
  size: 60
}
