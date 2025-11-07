import type { AlertSpecification } from '@features/Alert/types'
import type { Column } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

export function getExpandableRowCellCustomStyle(column: Column<AlertSpecification, any>): CSSProperties {
  const defaultStyle = {
    maxWidth: column.getSize()
  }

  switch (column.id) {
    case 'actions':
      return { ...defaultStyle, verticalAlign: 'bottom' }
    case 'validityPeriod':
      return { ...defaultStyle, verticalAlign: 'middle' }
    case 'isActivated':
      return { ...defaultStyle, paddingLeft: 11, verticalAlign: 'middle' }

    default:
      return defaultStyle
  }
}

export function getAlertCriteriaSummary(alertSpecification: AlertSpecification): string {
  let summary: string[] = []

  if (alertSpecification.vesselIds.length > 0) {
    summary = summary.concat('Navires')
  }
  if (alertSpecification.species.length > 0) {
    summary = summary.concat('Espèces à bord')
  }
  if (alertSpecification.speciesCatchAreas.length > 0) {
    summary = summary.concat('Zones de capture (FAR)')
  }
  if (alertSpecification.flagStatesIso2.length > 0) {
    summary = summary.concat('Nationalités')
  }
  if (alertSpecification.districtCodes.length > 0) {
    summary = summary.concat('Quartiers')
  }
  if (alertSpecification.producerOrganizations.length > 0) {
    summary = summary.concat('OPs')
  }
  if (alertSpecification.administrativeAreas.length > 0 || alertSpecification.regulatoryAreas.length > 0) {
    summary = summary.concat('Zones (VMS)')
  }
  if (alertSpecification.gears.length > 0) {
    summary = summary.concat('Engins à bord')
  }

  return summary.join(', ')
}
