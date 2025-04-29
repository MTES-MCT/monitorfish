import { ActionButtonsCell } from './cells/ActionButtonsCell'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { CellContext, ColumnDef } from '@tanstack/react-table'

export function getVesselGroupActionColumn(
  groupId: number,
  isFixedGroup: boolean
): ColumnDef<Vessel.VesselLastPosition, any> {
  return {
    accessorFn: row => row.vesselFeatureId,
    cell: (info: CellContext<Vessel.VesselLastPosition, string>) => (
      <ActionButtonsCell groupId={groupId} isFixedGroup={isFixedGroup} vessel={info.row.original} />
    ),
    enableSorting: false,
    header: () => '',
    id: 'actions',
    size: isFixedGroup ? 90 : 60
  }
}
