import type { MainAppUseCase } from '@store'

const USE_CASE_STORE: Record<string, MainAppUseCase | undefined> = {}

export class UseCaseStore {
  static get(key: string): MainAppUseCase | undefined {
    const pendingUseCase = USE_CASE_STORE[key]

    UseCaseStore.unset(key)

    return pendingUseCase
  }

  static set(key: string, useCase: MainAppUseCase) {
    USE_CASE_STORE[key] = useCase
  }

  static unset(key: string) {
    USE_CASE_STORE[key] = undefined
  }
}
