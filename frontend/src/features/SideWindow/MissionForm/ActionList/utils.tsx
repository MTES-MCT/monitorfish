import { getUtcizedDayjs } from '@mtes-mct/monitor-ui'

import type { MissionAction } from '../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../types'
import type { ReactNode } from 'react'

export function formatDateLabel(dateLabel: string) {
  return dateLabel.replace(
    /([a-z])([a-zéû]+)\.?$/,
    (_, firstMatch, secondMatch) => `${firstMatch.toLocaleUpperCase()}${secondMatch}`
  )
}

export function getTitleSuffix({ isVesselUnknown, vesselName }: MissionActionFormValues): ReactNode {
  if (isVesselUnknown) {
    return (
      <>
        - <strong>Navire inconnu</strong>
      </>
    )
  }

  if (vesselName) {
    return (
      <>
        - <strong>{vesselName}</strong>
      </>
    )
  }

  return 'à renseigner'
}

export function getMissionActionInfractionsFromMissionActionFromFormValues(
  missionActionFormValues: MissionActionFormValues
): Array<
  | MissionAction.GearInfraction
  | MissionAction.LogbookInfraction
  | MissionAction.SpeciesInfraction
  | MissionAction.OtherInfraction
> {
  return [
    ...(missionActionFormValues.gearInfractions ? missionActionFormValues.gearInfractions : []),
    ...(missionActionFormValues.logbookInfractions ? missionActionFormValues.logbookInfractions : []),
    ...(missionActionFormValues.speciesInfractions ? missionActionFormValues.speciesInfractions : []),
    ...(missionActionFormValues.otherInfractions ? missionActionFormValues.otherInfractions : [])
  ].filter(({ natinf }) => Boolean(natinf))
}

export function getMissionActionFormInitialValues(type: MissionAction.MissionActionType): MissionActionFormValues {
  return {
    actionDatetimeUtc: getUtcizedDayjs(new Date()).toISOString(),
    actionType: type,
    vesselTargeted: false
  }
}
