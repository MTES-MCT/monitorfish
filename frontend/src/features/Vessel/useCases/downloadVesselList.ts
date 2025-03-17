import {
  SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_COLUMN_ORDER,
  VesselListCsvExportFormat
} from '@features/Vessel/components/ExportVesselListDialog/constants'
import { VESSEL_LIST_CSV_MAP_BASE } from '@features/Vessel/components/ExportVesselListDialog/csvMap'
import { vesselSelectors } from '@features/Vessel/slice'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { downloadAsCsv, type DownloadAsCsvMap } from '@utils/downloadAsCsv'
import { pick } from 'lodash-es'

export const downloadVesselList =
  (columns: string[], selectedRows: Record<string, boolean>, format: VesselListCsvExportFormat) => (_, getState) => {
    const vessels = vesselSelectors.selectAll(getState().vessel.vessels)
    const filteredVessel = vessels.filter(vessel => vessel.isFiltered && selectedRows[vessel.vesselFeatureId])

    const now = customDayjs()
    const fileName = `export_vms_${now.utc().format('YYYY-MM-DDTHH-mm-ss[Z]')}`
    const selectedColumns = getSelectedColumns(columns, format)

    downloadAsCsv(fileName, filteredVessel, selectedColumns)
  }

function getSelectedColumns(
  columns: string[],
  format: VesselListCsvExportFormat
): DownloadAsCsvMap<Vessel.VesselLastPosition> {
  switch (format) {
    case VesselListCsvExportFormat.SPECIFIC_EXPORT_FOR_CUSTOMS:
      return pick(VESSEL_LIST_CSV_MAP_BASE, SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_COLUMN_ORDER)
    case VesselListCsvExportFormat.VMS_SITUATION:
      return pick(VESSEL_LIST_CSV_MAP_BASE, columns)
    default:
      return VESSEL_LIST_CSV_MAP_BASE
  }
}
