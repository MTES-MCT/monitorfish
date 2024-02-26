import { range, sortBy } from 'lodash'

import { JDP, UNTARGETED_SPECIES_CODE } from './constants'
import { MissionAction } from '../../domain/types/missionAction'

import type { ActivityReportWithId } from './types'
import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

export function formatDMDCoordinateForActivityReport(coordinate: string | undefined): string {
  const hemisphere = coordinate?.at(-1)
  if (!hemisphere) {
    return ''
  }

  const nextCoordinate = coordinate?.replace(/°/g, '')?.replace(/′/g, '')?.replace(` ${hemisphere}`, '')

  return `${hemisphere}${nextCoordinate}`
}

/**
 * Adds 'SPECIES' related columns, 'INFR' related columns and 'COMMENT' column to JDP_CSV_MAP_BASE
 */
export function getJDPCsvMap(baseCsvMap: DownloadAsCsvMap<ActivityReportWithId>, jdp: JDP) {
  const numberOfSpeciesColumns = 10
  const numberOfInfractionColumns = 10

  range(numberOfSpeciesColumns).forEach(index => {
    const count = index + 1

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`species${count}`] = {
      label: `SPECIES${count}`,
      transform: activity => {
        const speciesOnboard = activity.action.speciesOnboard[count - 1]
        if (!speciesOnboard?.speciesCode) {
          return ''
        }

        return speciesOnboard.speciesCode
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
        const allNatinfs = getInfractionsKeys(activity.action, 'natinf')

        return allNatinfs[count - 1] || ''
      }
    }

    // eslint-disable-next-line no-param-reassign
    baseCsvMap[`infractionDescription${count}`] = {
      label: jdp === JDP.WESTERN_WATERS ? `INFR${count}_DESCRIPTION` : `INFR_REMARK${count}`,
      transform: activity => {
        const allComments = getInfractionsKeys(activity.action, 'comments')

        return allComments[count - 1] || ''
      }
    }
  })

  // eslint-disable-next-line no-param-reassign
  baseCsvMap['action.otherComments'] = `COMMENT`

  return baseCsvMap
}

export function getSpeciesOnboardWithUntargetedSpeciesGrouped(
  speciesOnboard: MissionAction.SpeciesControl[],
  jdpSpecies: string[]
): MissionAction.SpeciesControl[] {
  const otherSpeciesSummedWeight = speciesOnboard
    .filter(species => !jdpSpecies.includes(species.speciesCode))
    .map(species => species.controlledWeight ?? species.declaredWeight)
    .filter((species): species is number => species !== undefined)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

  const otherSpecy = {
    controlledWeight: undefined,
    declaredWeight: otherSpeciesSummedWeight,
    nbFish: undefined,
    speciesCode: UNTARGETED_SPECIES_CODE,
    underSized: undefined
  }

  const speciesOnboardWithoutOtherSpecies = speciesOnboard.filter(species => jdpSpecies.includes(species.speciesCode))

  const groupedSpeciesOnboard = speciesOnboardWithoutOtherSpecies.concat(otherSpecy)

  return sortBy(groupedSpeciesOnboard, ({ declaredWeight }) => declaredWeight).reverse()
}

function getInfractionsKeys(action: MissionAction.MissionAction, key: string): string[] {
  return ([] as string[]).concat.apply(
    [],
    [
      getInfractionsWithRecordKey(action.gearInfractions, key),
      getInfractionsWithRecordKey(action.speciesInfractions, key),
      getInfractionsWithRecordKey(action.logbookInfractions, key),
      getInfractionsWithRecordKey(action.otherInfractions, key)
    ]
  )
}

function getInfractionsWithRecordKey(infractions: MissionAction.Infraction[], key: string): string[] {
  return infractions
    .filter(infraction => infraction.infractionType === MissionAction.InfractionType.WITH_RECORD)
    .map(infraction => infraction[key])
}

export function getPatrolType(activity: ActivityReportWithId): string {
  if (activity.action.actionType === MissionAction.MissionActionType.SEA_CONTROL) {
    return 'S'
  }

  if (activity.action.actionType === MissionAction.MissionActionType.LAND_CONTROL) {
    return 'L'
  }

  if (activity.action.actionType === MissionAction.MissionActionType.AIR_CONTROL) {
    return 'A'
  }

  return ''
}
