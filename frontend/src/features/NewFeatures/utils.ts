import { customDayjs } from '@mtes-mct/monitor-ui'
import orderBy from 'lodash-es/orderBy'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export function getFeaturesByMonths(features: MonitorFishFeature[]): Record<string, MonitorFishFeature[]> {
  return features.reduce((acc, feature) => {
    const date = customDayjs(feature.date).format('MMMM YYYY')
    const dateFeatures = acc[date]?.concat(feature) ?? [feature]

    return {
      ...acc,
      [date]: orderBy(dateFeatures, 'date', ['desc'])
    }
  }, {})
}

export function isFeatureDisplayed(isSuperUser: boolean) {
  return (feature: MonitorFishFeature) => {
    if (!isSuperUser && feature.for === 'CNSP') {
      return false
    }

    if (isSuperUser && feature.for === 'EXTERNAL') {
      return false
    }

    return true
  }
}
