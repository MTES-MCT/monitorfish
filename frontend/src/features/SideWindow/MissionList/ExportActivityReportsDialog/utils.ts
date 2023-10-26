import { range } from 'lodash'

import { JDP } from './constants'
import { MissionAction } from '../../../../domain/types/missionAction'

import type { ActivityReportWithId } from './types'
import type { DownloadAsCsvMap } from '../../../../utils/downloadAsCsv'

export function formatDMDCoordinateForActivityReport(coordinate: string | undefined): string {
  const hemisphere = coordinate?.at(-1)
  if (!hemisphere) {
    return ''
  }

  const nextCoordinate = coordinate?.replace(/°/g, '')?.replace(/′/g, '')?.replace(` ${hemisphere}`, '')

  return `${hemisphere}${nextCoordinate}`
}

export function getJDPCsvMap(baseCsvMap: DownloadAsCsvMap<ActivityReportWithId>, jdp: JDP) {
  const numberOfSpeciesColumns = 35
  const numberOfInfractionColumns = 12

  range(numberOfSpeciesColumns).forEach(index => {
    const count = index + 1

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`species${count}`] = {
      label: `SPECIES${count}`,
      transform: activity => {
        const speciesOnboard = activity.action.speciesOnboard[count - 1]

        return speciesOnboard?.speciesCode || ''
      }
    }

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`weight${count}`] = {
      label: `WEIGHT${count}`,
      transform: activity => {
        const speciesOnboard = activity.action.speciesOnboard[count - 1]

        return speciesOnboard?.controlledWeight || speciesOnboard?.declaredWeight || ''
      }
    }

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`nbFish${count}`] = {
      label: `NB_IND${count}`,
      transform: activity => {
        const speciesOnboard = activity.action.speciesOnboard[count - 1]

        return speciesOnboard?.nbFish || ''
      }
    }
  })

  range(numberOfInfractionColumns).forEach(index => {
    const count = index + 1

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`infractionClass${count}`] = jdp === JDP.WESTERN_WATERS ? `INFR${count}_CLASS` : `INFR_CLASS${count}`

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`infractionCode${count}`] = {
      label: jdp === JDP.WESTERN_WATERS ? `INFR${count}_CODE` : `INFR_CODE${count}`,
      transform: activity => {
        const allNatinfs = getAllInfractionKeys(activity.action, 'natinf')

        return allNatinfs[count - 1] || ''
      }
    }

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`infractionDescription${count}`] = {
      label: jdp === JDP.WESTERN_WATERS ? `INFR${count}_DESCRIPTION` : `INFR_REMARK${count}`,
      transform: activity => {
        const allComments = getAllInfractionKeys(activity.action, 'comments')

        return allComments[count - 1] || ''
      }
    }
  })

  // eslint-disable-next-line no-param-reassign
  baseCsvMap['action.otherComments'] = `COMMENT`

  return baseCsvMap
}

function getAllInfractionKeys(action: MissionAction.MissionAction, key: string): string[] {
  return ([] as string[]).concat.apply(
    [],
    [
      getInfractionWithRecordAndReturn(action.gearInfractions, key),
      getInfractionWithRecordAndReturn(action.speciesInfractions, key),
      getInfractionWithRecordAndReturn(action.logbookInfractions, key),
      getInfractionWithRecordAndReturn(action.otherInfractions, key)
    ]
  )
}

function getInfractionWithRecordAndReturn(
  infractions:
    | MissionAction.GearInfraction[]
    | MissionAction.SpeciesInfraction[]
    | MissionAction.LogbookInfraction[]
    | MissionAction.OtherInfraction[],
  key: string
): string[] {
  return infractions
    .filter(infraction => infraction.infractionType === MissionAction.InfractionType.WITH_RECORD)
    .map(infraction => infraction[key])
}
