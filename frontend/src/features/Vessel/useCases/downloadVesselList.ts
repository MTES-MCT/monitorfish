import { selectIsDataAvailablePredicate } from '@features/PositionReplay/replayableData'
import { selectPositionsDateTime } from '@features/PositionReplay/selectors'
import {
  SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_COLUMN_ORDER,
  VesselListCsvExportFormat
} from '@features/Vessel/components/ExportVesselListDialog/constants'
import {
  VESSEL_LIST_CSV_COLUMN_DATA_KIND,
  VESSEL_LIST_CSV_MAP_BASE
} from '@features/Vessel/components/ExportVesselListDialog/csvMap'
import { selectFilteredVesselFeatureIdsSet, vesselSelectors } from '@features/Vessel/slice'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { downloadAsCsv, type DownloadAsCsvMap } from '@utils/downloadAsCsv'
import { omitBy, pick } from 'lodash-es'

export const downloadVesselList =
  (columns: string[], selectedRows: Record<string, boolean>, format: VesselListCsvExportFormat) => (_, getState) => {
    const vessels = vesselSelectors.selectAll(getState().vessel.vessels)
    const filteredVesselFeatureIds = selectFilteredVesselFeatureIdsSet(getState())
    const filteredVessel = vessels.filter(
      vessel => filteredVesselFeatureIds.has(vessel.vesselFeatureId) && selectedRows[vessel.vesselFeatureId]
    )

    const isDataAvailable = selectIsDataAvailablePredicate(getState())
    const positionsDateTime = customDayjs(selectPositionsDateTime(getState()))
    const fileName = `export_vms_${positionsDateTime.utc().format('YYYY-MM-DDTHH-mm-ss[Z]')}`
    const selectedColumns = omitBy(getSelectedColumns(columns, format), (_value, key) => {
      const dataKind = VESSEL_LIST_CSV_COLUMN_DATA_KIND[key]

      return !!dataKind && !isDataAvailable(dataKind)
    })

    downloadAsCsv(fileName, filteredVessel as Omit<Vessel.ActiveVesselEmittingPosition, 'id'>[], selectedColumns)
  }

function getSelectedColumns(
  columns: string[],
  format: VesselListCsvExportFormat
): DownloadAsCsvMap<Omit<Vessel.ActiveVesselEmittingPosition, 'id'>> {
  switch (format) {
    case VesselListCsvExportFormat.SPECIFIC_EXPORT_FOR_CUSTOMS:
      return pick(VESSEL_LIST_CSV_MAP_BASE, SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_COLUMN_ORDER)
    case VesselListCsvExportFormat.VMS_SITUATION:
      return pick(VESSEL_LIST_CSV_MAP_BASE, columns)
    default:
      return VESSEL_LIST_CSV_MAP_BASE
  }
}
