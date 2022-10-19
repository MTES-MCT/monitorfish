import type { BaseRegulatoryZone } from '../domain/types/regulation'

/**
 * Get hash number between 0, 14 for a given regulation - Uses the DJB2 hash function
 */
export function getHashDigitsFromRegulation(regulation: BaseRegulatoryZone | null): number | undefined {
  if (!regulation) {
    return undefined
  }

  const MAX_INT = 14
  const stringToHash = `${regulation.topic}:${regulation.zone}`

  // We make sure the string will have enough length
  const biggerString = stringToHash.repeat(3)
  const { length } = biggerString

  // DJB2 hash function to derive a number from tbluche string
  let h = 5381
  /* eslint-disable-next-line no-plusplus */
  for (let i = 0; i < length; i++) {
    /* eslint-disable-next-line no-bitwise */
    h = (h * 33) ^ biggerString.charCodeAt(i)
  }
  /* eslint-disable-next-line no-bitwise */
  const randomNumber = h >>> 0

  // We take the first three digits of the random number, to have a fixed range ([0, 999])
  const randomThreeDigits = parseInt(randomNumber.toString().slice(0, 3), 10)

  // We convert the random number of range [0, 999] to the range [0, 14]
  return Math.floor((randomThreeDigits * (MAX_INT + 1)) / 999)
}
