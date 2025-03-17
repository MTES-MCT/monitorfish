import { VESSEL_LIST_CSV_MAP_BASE } from '@features/Vessel/components/ExportVesselListDialog/csvMap'
import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

export const VESSEL_LIST_EXPORT_CHECKBOX_OPTIONS = Object.keys(VESSEL_LIST_CSV_MAP_BASE).map(key => {
  const labelOrObject = VESSEL_LIST_CSV_MAP_BASE[key]
  const normalizedLabel = typeof labelOrObject === 'string' ? labelOrObject : labelOrObject?.label

  return {
    label: normalizedLabel ?? '',
    value: key
  }
})

export enum VesselListCsvExportFormat {
  SPECIFIC_EXPORT_FOR_CUSTOMS = 'SPECIFIC_EXPORT_FOR_CUSTOMS',
  VMS_SITUATION = 'VMS_SITUATION'
}
export const VESSEL_LIST_CSV_FORMAT_EXPORT_LABEL: Record<VesselListCsvExportFormat, string> = {
  SPECIFIC_EXPORT_FOR_CUSTOMS: 'Export spécifique Douanes',
  VMS_SITUATION: 'Export pour situation VMS'
}
export const VESSEL_LIST_CSV_FORMAT_AS_OPTIONS = getOptionsFromLabelledEnum(VESSEL_LIST_CSV_FORMAT_EXPORT_LABEL)

export const DEFAULT_CHECKBOXES_FIRST_COLUMN = ['flagState', 'vesselName', 'internalReferenceNumber', 'ircs', 'mmsi']
export const DEFAULT_CHECKBOXES_SECOND_COLUMN = []
export const DEFAULT_CHECKBOXES_THIRD_COLUMN = ['dateTime', 'latitude', 'longitude', 'course', 'speed']

/**
 * The order of properties needs to ke kept, as it is used to define the CSV column order when exporting.
 */
export const SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_COLUMN_ORDER = [
  'ircs',
  'vesselName',
  'externalReferenceNumber',
  'dateTime',
  'flagState',
  'latitude',
  'longitude'
]

export const SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_FIRST_COLUMN = [
  'ircs',
  'vesselName',
  'externalReferenceNumber',
  'flagState'
]
export const SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_SECOND_COLUMN = []
export const SPECIFIC_EXPORT_FOR_CUSTOMS_CHECKBOXES_THIRD_COLUMN = ['dateTime', 'latitude', 'longitude']
