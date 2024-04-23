import { getDay } from './getDay'
import { getMonth } from './getMonth'
import { getTime } from './getTime'

export const getDateTime = (dateString: string | undefined | null, withoutSeconds: boolean = false) => {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)
  const time = getTime(dateString, withoutSeconds)

  return `${getDay(date)}/${getMonth(date)}/${date.getUTCFullYear()} à ${time}`
}
