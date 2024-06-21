import { pick } from 'lodash'

import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, INITIAL_FORM_VALUES } from './constants'
import { PriorNotification } from '../../PriorNotification.types'

import type { FormValues } from './types'
import type { Undefine } from '@mtes-mct/monitor-ui'

export function getPartialComputationRequestData(formValues: FormValues) {
  return pick(formValues, ['faoArea', 'fishingCatches', 'portLocode', 'tripGearCodes', 'vesselId'])
}

export function getFishingsCatchesInitialValues(
  specyCode: string,
  specyName: string
): PriorNotification.PriorNotificationDataFishingCatch[] {
  switch (specyCode) {
    case 'BFT':
      return [
        {
          quantity: undefined,
          specyCode: 'BFT',
          specyName,
          weight: 0
        },
        ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES.map(extendedSpecyCode => ({
          quantity: 0,
          specyCode: extendedSpecyCode,
          specyName,
          weight: 0
        }))
      ]

    case 'SWO':
      return [
        {
          quantity: 0,
          specyCode: 'SWO',
          specyName,
          weight: 0
        }
      ]

    default:
      return [
        {
          quantity: undefined,
          specyCode,
          specyName,
          weight: 0
        }
      ]
  }
}

export function getInitialFormValues(): FormValues {
  return {
    ...INITIAL_FORM_VALUES,
    sentAt: new Date().toISOString()
  }
}

function getComputedState(
  priorNotificationComputedValues: Undefine<PriorNotification.ManualPriorNotificationComputedValues> | undefined
): PriorNotification.State | undefined {
  if (priorNotificationComputedValues?.isInVerificationScope === undefined) {
    return undefined
  }

  return priorNotificationComputedValues.isInVerificationScope
    ? PriorNotification.State.PENDING_VERIFICATION
    : PriorNotification.State.OUT_OF_VERIFICATION_SCOPE
}

export function getApplicableState(
  priorNotificationComputedValues: Undefine<PriorNotification.ManualPriorNotificationComputedValues> | undefined,
  priorNotificationDetail: PriorNotification.PriorNotificationDetail | undefined
): PriorNotification.State | undefined {
  const computedState = getComputedState(priorNotificationComputedValues)

  if (!!priorNotificationDetail && !!priorNotificationDetail.state) {
    // When editing an existing prior notification,
    // we need to check if the computed state is consistent with the last state update in DB.
    if (
      !!priorNotificationComputedValues &&
      !!computedState &&
      [PriorNotification.State.OUT_OF_VERIFICATION_SCOPE, PriorNotification.State.PENDING_VERIFICATION].includes(
        priorNotificationDetail.state
      ) &&
      priorNotificationDetail.state !== computedState
    ) {
      return computedState
    }

    return priorNotificationDetail.state
  }

  return computedState
}
