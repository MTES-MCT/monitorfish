/**
 * Get full hours contained in minutes
 */
export function getHours(minutes?: number) {
  if (!minutes) {
    return undefined
  }

  return Math.floor(minutes / 60)
}

/**
 * Get the modulo (remainder) of the hours contained in minutes
 */
export function getRemainingMinutes(minutes?: number) {
  const hours = getHours(minutes)
  if (hours === undefined || !minutes) {
    return undefined
  }

  const minutesOfHours = hours * 60

  return minutes % minutesOfHours
}
