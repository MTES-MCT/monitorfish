import type { PriorNotification } from './PriorNotification.types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

export function getPriorNotificationIdentifier(
  data: { [key: string]: any; operationDate: string; reportId: string } | undefined
): PriorNotification.Identifier | undefined {
  if (!data) {
    return undefined
  }

  return {
    operationDate: data.operationDate,
    reportId: data.reportId
  }
}

export function getPriorNotificationTypesFromLogbookMessagePnoTypes(
  logbookMessagePnoTypes: LogbookMessage.MessagePnoType[] | undefined
): PriorNotification.Type[] | undefined {
  return logbookMessagePnoTypes?.map(({ pnoTypeName, ...rest }) => ({
    ...rest,
    name: pnoTypeName
  }))
}

export function getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches(
  logbookMessageFishingCatches: LogbookMessage.Catch[] | undefined
): PriorNotification.FormDataFishingCatch[] | undefined {
  return logbookMessageFishingCatches?.map(({ species, speciesName, weight, ...rest }) => ({
    ...rest,
    specyCode: species,
    specyName: speciesName ?? `${species} (nom manquant)`,
    weight: weight!
  }))
}

export function isZeroNotice(
  fishingCatches: PriorNotification.FormDataFishingCatch[] | undefined
): boolean | undefined {
  if (fishingCatches === undefined || fishingCatches.length === 0) {
    return undefined
  }

  return fishingCatches.every(fishingCatch => fishingCatch.weight === 0)
}
