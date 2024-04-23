import { getDay } from './getDay'
import { getMonth } from './getMonth'

export const getDate = dateString => {
  if (dateString) {
    const date = new Date(dateString)

    return `${getDay(date)}/${getMonth(date)}/${date.getUTCFullYear()}`
  }

  return ''
}
