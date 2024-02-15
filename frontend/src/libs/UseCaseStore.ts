import { DisplayedErrorKey } from './DisplayedError/constants'

import type { MainAppUseCase } from '../types'

export enum UseCaseStoreKey {
  DRAFT_CANCELLATION_CONFIRMATION = 'DRAFT_CANCELLATION_CONFIRMATION'
}

const USE_CASE_STORE: Record<DisplayedErrorKey | UseCaseStoreKey, MainAppUseCase | undefined> = {
  [DisplayedErrorKey.MISSION_FORM_ERROR]: undefined,
  DRAFT_CANCELLATION_CONFIRMATION: undefined,
  [DisplayedErrorKey.VESSEL_SIDEBAR_ERROR]: undefined
}

export class UseCaseStore {
  static get(key: DisplayedErrorKey | UseCaseStoreKey): MainAppUseCase | undefined {
    const pendingUseCase = USE_CASE_STORE[key]

    UseCaseStore.unset(key)

    return pendingUseCase
  }

  static set(key: DisplayedErrorKey | UseCaseStoreKey, useCase: MainAppUseCase) {
    USE_CASE_STORE[key] = useCase
  }

  static unset(key: DisplayedErrorKey | UseCaseStoreKey) {
    USE_CASE_STORE[key] = undefined
  }
}
