import { removeAccents } from './removeAccents'

export function getTextForSearch(text) {
  if (!text) {
    return ''
  }

  return removeAccents(text)
    .toLowerCase()
    .replace(/[ ]/g, '')
    .replace(/[_]/g, '')
    .replace(/[-]/g, '')
    .replace(/[']/g, '')
    .replace(/["]/g, '')
}
