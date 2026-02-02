import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { downloadAsCsv } from '@utils/downloadAsCsv'
import { logSoftError } from '@utils/logSoftError'

import { activityReportApi } from '../apis'
import { JDP_CSV_MAP_BASE, MED_JDP_CSV_MAP } from '../components/ExportActivityReportsDialog/csvMap'
import { JDP } from '../constants'
import { getJDPCsvMap, getSpeciesOnboardWithUntargetedSpeciesGrouped } from '../utils'

import type { ActivityReports } from '../types'

export const NO_ACTIVITY_REPORT = 'NO_ACTIVITY_REPORT'

export const downloadActivityReports =
  (afterDateTime: string, beforeDateTime: string, jdp: JDP) =>
  async (dispatch): Promise<string> => {
    const {
      data: { activityReports, jdpSpecies }
    }: { data: ActivityReports } = await dispatch(
      activityReportApi.endpoints.getActivityReports.initiate(
        {
          afterDateTime,
          beforeDateTime,
          jdp
        },
        RTK_FORCE_REFETCH_QUERY_OPTIONS
      )
    )

    if (!activityReports?.length) {
      throw new Error(NO_ACTIVITY_REPORT)
    }

    const activityReportsWithId = activityReports.map((activity, index) => ({
      ...activity,
      action: {
        ...activity.action,
        speciesOnboard: getSpeciesOnboardWithUntargetedSpeciesGrouped(activity.action.speciesOnboard, jdpSpecies)
      },
      id: index
    }))
    const fileName = getCsvFileName(jdp)

    const baseCsvMap = jdp === JDP.MEDITERRANEAN_AND_EASTERN_ATLANTIC ? MED_JDP_CSV_MAP : JDP_CSV_MAP_BASE
    const csvMap = getJDPCsvMap(baseCsvMap, jdp)
    downloadAsCsv(fileName, activityReportsWithId, csvMap)

    return fileName
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
        message: 'JDP not found.'
      })

      return ''
    }
  }
}
