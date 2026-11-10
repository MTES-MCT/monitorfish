import {
  LIGHT_MODE_PREFERENCE_STORAGE_KEY,
  LightModePreference,
  SLOW_CONNECTION_EFFECTIVE_TYPES,
  SLOW_CONNECTION_MAX_DOWNLINK_MBPS,
  SLOW_CONNECTION_MIN_RTT_MS,
  SLOW_VESSELS_FETCH_MIN_DURATION_MS
} from './constants'
import { ROUTER_PATHS } from '../../paths'

/** Subset of the Network Information API (not available in Firefox and Safari). */
export type NetworkInformation = Partial<{
  downlink: number
  effectiveType: string
  rtt: number
}>

export function isConnectionSlow({
  connection,
  vesselsFetchDurationMs
}: {
  connection: NetworkInformation | undefined
  vesselsFetchDurationMs: number | undefined
}): boolean {
  if (vesselsFetchDurationMs !== undefined && vesselsFetchDurationMs >= SLOW_VESSELS_FETCH_MIN_DURATION_MS) {
    return true
  }
  if (!connection) {
    return false
  }

  return (
    (!!connection.effectiveType && SLOW_CONNECTION_EFFECTIVE_TYPES.includes(connection.effectiveType)) ||
    (connection.rtt !== undefined && connection.rtt > SLOW_CONNECTION_MIN_RTT_MS) ||
    (connection.downlink !== undefined &&
      connection.downlink > 0 &&
      connection.downlink < SLOW_CONNECTION_MAX_DOWNLINK_MBPS)
  )
}

/**
 * The storage may be unavailable (private browsing, blocked site data): the preference is then not remembered.
 */
export function getLightModePreference(): LightModePreference | undefined {
  try {
    const preference = localStorage.getItem(LIGHT_MODE_PREFERENCE_STORAGE_KEY)

    return Object.values(LightModePreference).find(value => value === preference)
  } catch {
    return undefined
  }
}

export function setLightModePreference(preference: LightModePreference): void {
  try {
    localStorage.setItem(LIGHT_MODE_PREFERENCE_STORAGE_KEY, preference)
  } catch {
    // The preference is only a convenience
  }
}

/**
 * Returns the light mode URL when the main window is opened by a user who enabled the light mode.
 */
export function getLightModeRedirection(pathname: string, hash: string): string | undefined {
  if (pathname !== ROUTER_PATHS.home || getLightModePreference() !== LightModePreference.ENABLED) {
    return undefined
  }

  return `${ROUTER_PATHS.light}${hash}`
}

/**
 * The whole app is reloaded (not a client-side navigation), as the monitoring and the service worker
 * are configured at startup depending on the mode.
 */
export function switchLightMode(isEnabled: boolean): void {
  setLightModePreference(isEnabled ? LightModePreference.ENABLED : LightModePreference.DECLINED)

  window.location.assign(`${isEnabled ? ROUTER_PATHS.light : ROUTER_PATHS.home}${window.location.hash}`)
}
