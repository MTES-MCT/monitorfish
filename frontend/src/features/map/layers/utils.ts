import type { BaseRegulatoryZone } from '../../../domain/types/regulation'

/**
 * Get hash number between [0, 11] for a given regulation - Uses the DJB2 hash function
 */
export function getHashDigitsFromRegulation(regulation: BaseRegulatoryZone | null): number | undefined {
  if (!regulation) {
    return undefined
  }

  const MAX_INT = 11
  const stringToHash = `${regulation.topic}:${regulation.zone}`

  // We make sure the string will have enough length
  const biggerString = stringToHash.repeat(3)
  const { length } = biggerString

  // Make this function uniform

  // DJB2 hash function to derive a number from the string
  let hash = 5381
  /* eslint-disable-next-line no-plusplus */
  for (let i = 0; i < length; i++) {
    /* eslint-disable-next-line no-bitwise */
    hash = (hash * 33) ^ biggerString.charCodeAt(i)
  }

  /**
   *    This magic number *2* makes the random number looks a bit more distributed in an uniform manner:
           0: 13%
           1: 9%
           2: 7%
           3: 7%
           4: 6%
           5: 7%
           6: 9%
           7: 7%
           8: 8%
           9: 7%
           10: 9%
           11: 6%
   */
  /* eslint-disable-next-line no-bitwise */
  const randomNumber = hash >>> 2

  // We take the first three digits of the random number, to have a fixed range ([0, 999])
  const randomThreeDigits = parseInt(randomNumber.toString().slice(0, 3), 10)

  // We convert the random number of range [0, 999] to the range [0, MAX_INT]
  return Math.floor((randomThreeDigits * (MAX_INT + 2)) / 999) - 1
}
