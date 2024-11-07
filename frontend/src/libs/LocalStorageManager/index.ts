import type { LocalStorageKey } from './constants'
import type { Defined } from '@mtes-mct/monitor-ui'

interface LocalStorageManager {
  get<T>(key: LocalStorageKey): T | undefined
  get<T>(key: LocalStorageKey, defaultValue: Defined<T>): T

  set<T>(key: LocalStorageKey, value: Defined<T>): void

  unset(key: LocalStorageKey): void
}

export const localStorageManager: LocalStorageManager = {
  get<T>(key: LocalStorageKey, defaultValue?: Defined<T>): T | undefined {
    const rawValue = window.localStorage.getItem(key)

    return rawValue ? JSON.parse(rawValue) : defaultValue
  },

  set<T>(key: LocalStorageKey, value: Defined<T>): void {
    window.localStorage.setItem(key, JSON.stringify(value))
  },

  unset(key: LocalStorageKey): void {
    window.localStorage.removeItem(key)
  }
}
