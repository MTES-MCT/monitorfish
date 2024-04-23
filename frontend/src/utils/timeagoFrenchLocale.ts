const SECONDS = 60
const MINUTES = 60
const HOURS = 24
const SECONDS_IN_DAY = HOURS * MINUTES * SECONDS

export function timeagoFrenchLocale(_, index, totalSec) {
  // Between 105s - 120s, round up to 2 minutes
  // Won’t work for already mounted components because won’t update between 60-120s
  if (index === 2 && totalSec >= 105) {
    return ['2 minutes ago', 'in 2 minutes']
  }

  // 1-6 days ago should be based on actual days of the week (from 0:00 - 23:59)
  if (index === 6 || index === 7) {
    // Calculate seconds since midnight for right now
    const now = new Date()
    const secondsSinceMidnight = now.getSeconds() + now.getMinutes() * SECONDS + now.getHours() * MINUTES * SECONDS

    // Subtract seconds since midnight from totalSec, divide by seconds in a day, round down
    // Result is off-by-one number of days since datetime (unless time was at midnight)
    const daysFloored = Math.floor((totalSec - secondsSinceMidnight) / SECONDS_IN_DAY)
    // If time was at midnight (00:00), it will divide evenly with SECONDS_IN_DAY
    // That will make it count as from the previous day, which we do not want
    const remainder = (totalSec - secondsSinceMidnight) % SECONDS_IN_DAY
    const days = remainder >= 1 ? daysFloored + 1 : daysFloored
    const noun = days === 1 ? 'jour' : 'jours'

    return [`il y a  ${days} ${noun}`, `${days} ${noun}`]
  }

  // For 9-12 days ago, Convert “1 week ago” to “__ days ago”
  // For 13 days, round it to “2 weeks ago”
  if (index === 8) {
    const days = Math.round(totalSec / SECONDS / MINUTES / HOURS)
    if (days > 8) {
      return days === 13 ? ['il y a 2 semaines', '2 semaines'] : ['il y a %s jours', '%s jours']
    }
  }

  // For below 62 days (~ 2 months), show days number
  if (index === 9 || index === 10) {
    const days = Math.round(totalSec / SECONDS / MINUTES / HOURS)
    if (days <= 62) {
      return [`il y a ${days} jours`, `${days} jours`]
    }

    return ['il y a %s mois', '%s mois']
  }

  return [
    ["à l'instant", 'un instant'],
    ['il y a %s secondes', '%s secondes'],
    ['il y a 1 minute', '1 minute'],
    ['il y a %s minutes', '%s minutes'],
    ['il y a 1 heure', '1 heure'],
    ['il y a %s heures', '%s heures'],
    ['il y a 1 jour', '1 jour'],
    ['il y a %s jours', '%s jours'],
    ['il y a 1 semaine', '1 semaine'],
    ['il y a %s semaines', '%s semaines'],
    ['il y a 1 mois', '1 mois'],
    ['il y a %s mois', '%s mois'],
    ['il y a 1 an', '1 an'],
    ['il y a %s ans', '%s ans']
  ][index]
}
