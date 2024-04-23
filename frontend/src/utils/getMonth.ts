export function getMonth(date) {
  const month = date.getUTCMonth() + 1

  return month < 10 ? `0${month}` : `${month}`
}
