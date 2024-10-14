import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, BLUEFIN_TUNA_NAME_FR, BLUEFIN_TUNA_SPECY_CODE } from './constants'

import type { ManualPriorNotificationFormValuesFishingCatch } from './components/ManualPriorNotificationForm/types'
import type { PriorNotification } from './PriorNotification.types'
import type { Logbook } from '@features/Logbook/Logbook.types'

type PriorNotificationData = {
  operationDate: string
  reportId: string
}

export function getPriorNotificationIdentifier(data: PriorNotificationData): PriorNotification.Identifier
export function getPriorNotificationIdentifier(data: undefined): undefined
export function getPriorNotificationIdentifier(
  data: PriorNotificationData | undefined
): PriorNotification.Identifier | undefined
export function getPriorNotificationIdentifier(
  data: PriorNotificationData | undefined
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
  logbookMessagePnoTypes: Logbook.MessagePnoType[] | undefined
): PriorNotification.Type[] | undefined {
  return logbookMessagePnoTypes?.map(({ pnoTypeName, ...rest }) => ({
    ...rest,
    name: pnoTypeName
  }))
}

export function getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches(
  logbookMessageFishingCatches: Logbook.Catch[] | undefined
): PriorNotification.FormDataFishingCatch[] | undefined {
  return logbookMessageFishingCatches?.map(({ species, speciesName, weight, ...rest }) => ({
    ...rest,
    specyCode: species,
    specyName: speciesName ?? `${species} (nom manquant)`,
    weight: weight!
  }))
}

export function getFormValuesFishingCatchesFromFormDataFishingCatches(
  formDataFishingCatches: PriorNotification.FormDataFishingCatch[]
): ManualPriorNotificationFormValuesFishingCatch[] {
  // Either there is a global FAO Area, in which case all fishing catches are simply unique by `specyCode`,
  // or there is no global FAO Area, in which case we need to group fishing catches by `specyCode` + `faoArea`.
  const formValuesFishingCatchesMap = formDataFishingCatches.reduce((fishingCatchesMap, formDataFishingCatch) => {
    if ([BLUEFIN_TUNA_SPECY_CODE, ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES].includes(formDataFishingCatch.specyCode)) {
      const key = `${BLUEFIN_TUNA_SPECY_CODE}-${formDataFishingCatch.faoArea}`
      const existingBluefinTunaFishingCatch: ManualPriorNotificationFormValuesFishingCatch = fishingCatchesMap.get(
        key
      ) ?? {
        faoArea: formDataFishingCatch.faoArea,
        quantity: undefined,
        specyCode: BLUEFIN_TUNA_SPECY_CODE,
        specyName: BLUEFIN_TUNA_NAME_FR,
        weight: 0
      }

      const partialFormValuesFishingCatch =
        formDataFishingCatch.specyCode === BLUEFIN_TUNA_SPECY_CODE
          ? { ...existingBluefinTunaFishingCatch, ...formDataFishingCatch }
          : {
              ...existingBluefinTunaFishingCatch,
              $bluefinTunaExtendedCatch: {
                ...(existingBluefinTunaFishingCatch.$bluefinTunaExtendedCatch ?? {}),
                [formDataFishingCatch.specyCode]: {
                  quantity: formDataFishingCatch.quantity ?? 0,
                  specyName: formDataFishingCatch.specyName,
                  weight: formDataFishingCatch.weight ?? 0
                }
              }
            }

      fishingCatchesMap.set(key, partialFormValuesFishingCatch as ManualPriorNotificationFormValuesFishingCatch)
    } else {
      const key = `${formDataFishingCatch.specyCode}-${formDataFishingCatch.faoArea}`

      fishingCatchesMap.set(key, formDataFishingCatch)
    }

    return fishingCatchesMap
  }, new Map<string, ManualPriorNotificationFormValuesFishingCatch>())

  return Array.from(formValuesFishingCatchesMap.values())
}

export function getFormDataFishingCatchesFromFormValuesFishingCatches(
  formValuesFishingCatches: ManualPriorNotificationFormValuesFishingCatch[]
): PriorNotification.FormDataFishingCatch[] {
  return formValuesFishingCatches.reduce<PriorNotification.FormDataFishingCatch[]>(
    (accumulator, formValuesFishingCatch) => {
      if (formValuesFishingCatch.specyCode === BLUEFIN_TUNA_SPECY_CODE) {
        const { $bluefinTunaExtendedCatch, ...mainBluefinTunaFishingCatch } = formValuesFishingCatch

        accumulator.push(mainBluefinTunaFishingCatch)

        if ($bluefinTunaExtendedCatch) {
          const extendedCatches = Object.entries($bluefinTunaExtendedCatch).map(([specyCode, catchData]) => ({
            faoArea: formValuesFishingCatch.faoArea,
            quantity: catchData.quantity,
            specyCode,
            specyName: catchData.specyName,
            weight: catchData.weight
          }))

          accumulator.push(...extendedCatches)
        }
      } else {
        accumulator.push(formValuesFishingCatch)
      }

      return accumulator
    },
    []
  )
}

export function isPriorNotificationZero(
  fishingCatches: PriorNotification.FormDataFishingCatch[] | undefined
): boolean | undefined {
  if (fishingCatches === undefined || fishingCatches.length === 0) {
    return undefined
  }

  return fishingCatches.every(fishingCatch => fishingCatch.weight === 0)
}
