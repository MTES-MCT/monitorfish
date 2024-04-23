export function getNauticalMilesFromMeters(length) {
  return Math.round((length / 1000) * 100 * 0.539957) / 100
}
