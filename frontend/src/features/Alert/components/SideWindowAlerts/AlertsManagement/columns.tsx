import {Ellipsised} from '@components/Ellipsised'
import {isLegacyFirefox} from '@utils/isLegacyFirefox'

import {ActionButtonsCell} from './cells/ActionButtonsCell'

import type {CellContext, ColumnDef} from '@tanstack/react-table'
import type {AlertSpecification} from "@features/Alert/types";
import {Toggle} from "rsuite";

export function getTableColumns(isFromUrl: boolean): Array<ColumnDef<AlertSpecification, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0

  return [
    {
      accessorFn: row => row.type + row.id,
      cell: ({ row }) => {
        const alertSpecification = row.original
        return (
          <Toggle
            checked={alertSpecification.isActivated}
            onChange={checked => {}}
            size="sm"
          />
        );
      },
      enableSorting: false,
      header: () => '',
      id: 'isActivated',
      size: 25 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.name,
      cell: (info: CellContext<AlertSpecification, string>) => (
          <Ellipsised>
            {info.getValue()}
          </Ellipsised>
        ),
      enableSorting: true,
      header: () => 'Nom',
      id: 'name',
      size: 288 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.type + row.id,
      cell: (info: CellContext<AlertSpecification, string>) => (
        <Ellipsised>
          Test
        </Ellipsised>
      ),
      enableSorting: true,
      header: () => 'Critères de déclenchement',
      id: 'criterias',
      size: 480 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.natinfCode,
      enableSorting: true,
      header: () => 'NATINF',
      id: 'natinfCode'
    },
    {
      accessorFn: row => row.type + row.id,
      cell: (info: CellContext<AlertSpecification, string>) => (
        <ActionButtonsCell alertSpecification={info.row.original} />
      ),
      enableSorting: false,
      header: () => '',
      id: 'actions',
      size: 88 + legacyFirefoxOffset
    }
  ]
}
