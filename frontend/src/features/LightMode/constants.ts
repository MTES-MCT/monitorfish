export enum LightModePreference {
  DECLINED = 'DECLINED',
  ENABLED = 'ENABLED'
}

export const LIGHT_MODE_PREFERENCE_STORAGE_KEY = 'MONITORFISH_LIGHT_MODE_PREFERENCE'

// `effectiveType` values of the Network Information API reached by the satellite links of the patrol vessels
export const SLOW_CONNECTION_EFFECTIVE_TYPES = ['slow-2g', '2g', '3g']
export const SLOW_CONNECTION_MIN_RTT_MS = 500
export const SLOW_CONNECTION_MAX_DOWNLINK_MBPS = 1
// The active vessels are downloaded in a few seconds on a usual connection
export const SLOW_VESSELS_FETCH_MIN_DURATION_MS = 15_000
