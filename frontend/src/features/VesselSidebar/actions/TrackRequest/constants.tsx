import { HighlightPositionCell } from '@features/VesselSidebar/actions/TrackRequest/HighlightPositionCell'
import { getLocalizedDayjs } from '@mtes-mct/monitor-ui'
import { isNumeric } from '@utils/isNumeric'

import { VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'

import type { VesselPosition } from '../../../../domain/entities/vessel/types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { ColumnDef } from '@tanstack/react-table'

export const POSITION_TABLE_COLUMNS: Array<ColumnDef<VesselPosition & { id: number }>> = [
  {
    accessorKey: 'id',
    cell: info => <HighlightPositionCell row={info.row.original} value={info.getValue()} />,
    enableSorting: false,
    header: '#',
    size: 0
  },
  {
    accessorFn: row => getLocalizedDayjs(row.dateTime).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
    cell: info => (
      <HighlightPositionCell isManualPositionMarkerShowed row={info.row.original} value={info.getValue()} />
    ),
    enableSorting: true,
    header: 'GDH',
    id: 'dateTime',
    size: 160
  },
  {
    accessorFn: row => (isNumeric(row.speed) ? `${row.speed} nds` : '-'),
    cell: info => <HighlightPositionCell row={info.row.original} value={info.getValue()} />,
    enableSorting: true,
    header: 'Vit.',
    id: 'speed',
    size: 50
  },
  {
    accessorFn: row => (isNumeric(row.course) ? `${row.course} °` : '-'),
    cell: info => <HighlightPositionCell row={info.row.original} value={info.getValue()} />,
    enableSorting: true,
    header: 'Cap',
    id: 'course',
    size: 40
  }
]

export const SELECT_TRACK_DEPTH_OPTIONS: Option<VesselTrackDepth>[] = [
  {
    label: 'le dernier DEP',
    value: VesselTrackDepth.LAST_DEPARTURE
  },
  {
    label: '12 heures',
    value: VesselTrackDepth.TWELVE_HOURS
  },
  {
    label: '24 heures',
    value: VesselTrackDepth.ONE_DAY
  },
  {
    label: '2 jours',
    value: VesselTrackDepth.TWO_DAYS
  },
  {
    label: '3 jours',
    value: VesselTrackDepth.THREE_DAYS
  },
  {
    label: '1 semaine',
    value: VesselTrackDepth.ONE_WEEK
  },
  {
    label: '2 semaines',
    value: VesselTrackDepth.TWO_WEEK
  },
  {
    label: '1 mois',
    value: VesselTrackDepth.ONE_MONTH
  }
]
