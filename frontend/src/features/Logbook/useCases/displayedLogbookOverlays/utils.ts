import type { Dayjs } from 'dayjs'

export const binarySearchLine = (activityDateTime: Dayjs, sortedLines: any): any | undefined => {
  let left = 0
  let right = sortedLines.length - 1
  let result

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const { end, line, start } = sortedLines[mid]

    if (activityDateTime.isSame(start) || activityDateTime.isAfter(start)) {
      if (activityDateTime.isBefore(end)) {
        result = line // Found a valid track, but continue to find the closest
        right = mid - 1 // Look for an earlier match (optional)
      } else {
        left = mid + 1 // Move right
      }
    } else {
      right = mid - 1 // Move left
    }
  }

  return result
}
