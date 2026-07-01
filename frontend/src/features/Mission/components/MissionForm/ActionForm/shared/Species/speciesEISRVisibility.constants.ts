// Hardcoded per business decision — see GitHub #5168.
export const SMALL_PELAGIC_SPECIES_CODES = ['ANE', 'PIL', 'HER', 'HOM', 'MAC', 'SPR', 'WHB', 'ARG']

// Duplicated rather than imported from `features/PriorNotification/constants.ts`, since
// `features/Mission` never imports from peer features in this codebase.
export const BLUEFIN_TUNA_SPECY_CODE = 'BFT'
export const SWORDFISH_SPECY_CODE = 'SWO'

export const SEPARATE_STOWAGE_MIN_VESSEL_LENGTH_METERS = 12
export const UNDER_SIZED_SEPARATE_STOWAGE_MIN_VESSEL_LENGTH_METERS = 12
export const UNDER_SIZED_SEPARATE_RECORDING_MIN_VESSEL_LENGTH_METERS = 10
export const SMALL_PELAGICS_SHARE_THRESHOLD = 0.8
