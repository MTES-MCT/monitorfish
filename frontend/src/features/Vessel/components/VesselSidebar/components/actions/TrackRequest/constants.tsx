import { HighlightPositionCell } from '@features/Vessel/components/VesselSidebar/components/actions/TrackRequest/HighlightPositionCell'
import { Vessel } from '@features/Vessel/Vessel.types'
import { getLocalizedDayjs } from '@mtes-mct/monitor-ui'
import { isNumeric } from '@utils/isNumeric'

import { VesselTrackDepth } from '../../../../../types/vesselTrackDepth'

import type { VesselPositionWithId } from '@features/Vessel/components/VesselSidebar/components/actions/TrackRequest/types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { ColumnDef } from '@tanstack/react-table'

export const POSITION_TABLE_COLUMNS: Array<ColumnDef<VesselPositionWithId>> = [
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
      <HighlightPositionCell
        isAtPortPositionMarkerShowed
        isManualPositionMarkerShowed
        isNetworkTypeMarkerShowed
        row={info.row.original}
        value={info.getValue()}
      />
    ),
    enableSorting: true,
    header: 'GDH',
    id: 'dateTime',
    size: 190
  },
  {
    accessorFn: row => (isNumeric(row.speed) ? `${row.speed} nds` : '-'),
    cell: info => <HighlightPositionCell row={info.row.original} value={info.getValue()} />,
    enableSorting: true,
    header: 'Vit.',
    id: 'speed',
    size: 40
  },
  {
    accessorFn: row => (isNumeric(row.course) ? `${row.course} °` : '-'),
    cell: info => <HighlightPositionCell row={info.row.original} value={info.getValue()} />,
    enableSorting: true,
    header: 'Cap',
    id: 'course',
    size: 30
  }
]

export const DUMMY_VESSEL_POSITION: Vessel.VesselPosition = {
  course: 0,
  dateTime: '',
  destination: undefined,
  externalReferenceNumber: undefined,
  flagState: 'FR',
  from: '',
  internalReferenceNumber: undefined,
  ircs: undefined,
  isAtPort: undefined,
  isFishing: undefined,
  isManual: undefined,
  latitude: 0,
  longitude: 0,
  mmsi: undefined,
  networkType: undefined,
  positionType: '',
  speed: 0,
  tripNumber: undefined,
  vesselName: ''
}

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
