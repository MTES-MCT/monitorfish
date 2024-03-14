import { checkURL } from '@features/Regulation/utils'

/**
 * @returns true if a regulatory text form value is missing or incorrect, else false
 */
export function checkOtherRequiredValues(startDate, endDate, textType) {
  return !startDate || startDate === '' || !endDate || endDate === '' || !textType || textType.length === 0
}

/**
 * @return true if a value is missing, else false
 */
export function checkNameAndUrl(reference, url) {
  let required = !reference || reference === ''
  let oneValueIsMissing = required

  required = !url || url === '' || !checkURL(url)
  oneValueIsMissing = oneValueIsMissing || required

  return oneValueIsMissing
}
