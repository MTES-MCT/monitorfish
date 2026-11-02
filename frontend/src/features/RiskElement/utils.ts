import { customDayjs } from '@mtes-mct/monitor-ui'
import { pluralize } from '@utils/pluralize'

import { RiskElement } from './types'

const formatTripDate = (dateTimeUtc: string) => customDayjs(dateTimeUtc).utc().format('DD/MM/YY')

export function getNonCompliantTripLabel(trip: RiskElement.NonCompliantTrip): string {
  const tripLabel = `Marée n°${trip.tripNumber}`
  if (!trip.startDateTimeUtc || !trip.endDateTimeUtc) {
    return tripLabel
  }

  return `${tripLabel} (${formatTripDate(trip.startDateTimeUtc)} au ${formatTripDate(trip.endDateTimeUtc)})`
}

export function getRiskElementTitle(riskElement: RiskElement.VesselRiskElement, label: string): string {
  const { metrics } = riskElement
  if (metrics.type === RiskElement.MetricsType.OCCURRENCES) {
    return `${label} – ${metrics.occurrences} ${pluralize('occurrence', metrics.occurrences)}`
  }

  const numberOfNonCompliantTrips = metrics.totalTrips - metrics.compliantTrips

  return `${label} – ${numberOfNonCompliantTrips}/${metrics.totalTrips} ${pluralize('marée', metrics.totalTrips)} non ${pluralize('conforme', metrics.totalTrips)}`
}
