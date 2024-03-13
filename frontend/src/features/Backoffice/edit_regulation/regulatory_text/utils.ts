import { checkURL } from '@features/Regulation/utils'

/**
 * @returns true if a regulatory text form value is missing or incorrect, else false
 */
export function checkOtherRequiredValues(startDate, endDate, textType) {
  let oneValueIsMissing = false

  let valueIsMissing = !startDate || startDate === ''
  oneValueIsMissing = oneValueIsMissing || valueIsMissing
  valueIsMissing = !endDate || endDate === ''
  oneValueIsMissing = oneValueIsMissing || valueIsMissing
  valueIsMissing = !textType || textType.length === 0
  oneValueIsMissing = oneValueIsMissing || valueIsMissing

  return oneValueIsMissing
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
