/** LAST_DEPARTURE is relative to now: replayed tracks always span the 12 hours before the replayed date. */
export const REPLAYED_TRACK_DEPTH_IN_HOURS = 12

export const DISABLED_DURING_POSITION_REPLAY_MESSAGE = 'Indisponible en mode rejeu des positions'

export const DYNAMIC_VESSEL_GROUP_UNAVAILABLE_DURING_POSITION_REPLAY_MESSAGE =
  'Les groupes dynamiques sont calculés avec les données actuelles des navires : ils ne peuvent pas être créés en mode rejeu des positions.'

/** See `ReplayWindow.VMS_LOOKBACK` in the backend: older VMS positions are not replayed. */
export const VMS_REPLAY_LOOKBACK_IN_HOURS = 6

export const POSITION_REPLAY_BANNER_HEIGHT = 58
