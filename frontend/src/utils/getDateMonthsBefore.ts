/**
 * get the date before nofMonths for a given {@param date}
 * @param {Date} date
 * @param {Number} nofMonths no of months to get date before
 * @returns {Date} date before nofMonths months
 */
export function getDateMonthsBefore(date, nofMonths) {
  const thisMonth = date.getMonth()
  // set the month index of the date by subtracting nofMonths from the current month index
  date.setMonth(thisMonth - nofMonths)
  // When trying to add or subtract months from a Javascript Date() Object which is any end date of a month,
  // JS automatically advances your Date object to next month's first date if the resulting date does not exist in its month.
  // For example when you add 1 month to October 31, 2008 , it gives Dec 1, 2008 since November 31, 2008 does not exist.
  // if the result of subtraction is negative and add 6 to the index and check if JS has auto advanced the date,
  // then set the date again to last day of previous month
  // Else check if the result of subtraction is non negative, subtract nofMonths to the index and check the same.
  if (
    (thisMonth - nofMonths < 0 && date.getMonth() !== thisMonth + nofMonths) ||
    (thisMonth - nofMonths >= 0 && date.getMonth() !== thisMonth - nofMonths)
  ) {
    date.setDate(0)
  }

  return date
}
