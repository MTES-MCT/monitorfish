import { THEME } from '@mtes-mct/monitor-ui'

export const DEFAULT_ZONE_COLOR = THEME.color.earthYellow
export const DEFAULT_ZONE_BORDER = THEME.color.darkGoldenrod

export const DIGIT_TO_LAYER_COLOR_MAP = new Map<number, string>([
  [0, THEME.color.pear],
  [1, THEME.color.pear],
  [2, THEME.color.jonquil],
  [3, THEME.color.jonquil],
  [4, THEME.color.earthYellow],
  [5, THEME.color.earthYellow],
  [6, THEME.color.ecru],
  [7, THEME.color.ecru],
  [8, THEME.color.goldMetallic],
  [9, THEME.color.goldMetallic],
  [10, THEME.color.mindaro],
  [11, THEME.color.mindaro]
])
