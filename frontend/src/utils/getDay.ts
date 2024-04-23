export function getDay(date) {
  const day = date.getUTCDate()

  return day < 10 ? `0${day}` : `${day}`
}
