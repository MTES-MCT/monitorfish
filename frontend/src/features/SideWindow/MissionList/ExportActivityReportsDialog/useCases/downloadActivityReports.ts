import { customDayjs, logSoftError } from '@mtes-mct/monitor-ui'

import { downloadAsCsv } from '../../../../../utils/downloadAsCsv'
import { activityReportApi } from '../apis'
import { JDP } from '../constants'
import { JDP_CSV_MAP_BASE } from '../csvMap'
import { getJDPCsvMap } from '../utils'

export const downloadActivityReports = (afterDateTime: string, beforeDateTime: string, jdp: JDP) => async dispatch => {
  const { data: activityReports } = await dispatch(
    activityReportApi.endpoints.getActivityReports.initiate({
      afterDateTime,
      beforeDateTime,
      jdp
    })
  )

  // TODO If there is not activityReports, do not download the csv

  const activityReportsWithId = activityReports.map((activity, index) => ({ ...activity, id: index }))
  const fileName = getCsvFileName(jdp)

  const csvMap = getJDPCsvMap(JDP_CSV_MAP_BASE, jdp)
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
