import { customDayjs, logSoftError } from '@mtes-mct/monitor-ui'
import { sortBy } from 'lodash'

import { downloadAsCsv } from '../../../../../utils/downloadAsCsv'
import { activityReportApi } from '../apis'
import { JDP } from '../constants'
import { JDP_CSV_MAP_BASE } from '../csvMap'
import { getJDPCsvMap } from '../utils'

import type { ActivityReports } from '../types'

export const NO_ACTIVITY_REPORT = 'NO_ACTIVITY_REPORT'

export const downloadActivityReports = (afterDateTime: string, beforeDateTime: string, jdp: JDP) => async dispatch => {
  const {
    data: { activityReports, jdpSpecies }
  }: { data: ActivityReports } = await dispatch(
    activityReportApi.endpoints.getActivityReports.initiate({
      afterDateTime,
      beforeDateTime,
      jdp
    })
  )

  if (!activityReports?.length) {
    throw new Error(NO_ACTIVITY_REPORT)
  }

  const activityReportsWithId = activityReports.map((activity, index) => ({
    ...activity,
    action: {
      ...activity.action,
      // We sort species by weight as only 10 species columns are contained in the CSV
      speciesOnboard: sortBy(activity.action.speciesOnboard, ({ declaredWeight }) => declaredWeight).reverse()
    },
    id: index
  }))
  const fileName = getCsvFileName(jdp)

  const csvMap = getJDPCsvMap(JDP_CSV_MAP_BASE, jdp, jdpSpecies)
  downloadAsCsv(fileName, activityReportsWithId, csvMap)
}

function getCsvFileName(jdp: JDP) {
  const today = customDayjs()
  const jdpLabel = getJdpLabel(jdp)

  return `FRA_ACTREP_${jdpLabel}_JDP_${today.year()}_${today.month()}_${today.date()}`
}

function getJdpLabel(jdp: JDP) {
  const value = JDP[jdp]

  switch (value) {
    case JDP.MEDITERRANEAN_AND_EASTERN_ATLANTIC:
      return 'MED'
    case JDP.NORTH_SEA:
      return 'NS-01'
    case JDP.WESTERN_WATERS:
      return 'WW-01'
    default: {
      logSoftError({
        isSideWindowError: false,
        message: 'JDP not found.'
      })

      return ''
    }
  }
}
