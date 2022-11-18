export function pushToObjectAtIndex(record: Record<string, any[]>, index: string, item: any): Record<string, any[]> {
  const nextRecord = record

  if (nextRecord[index]) {
    nextRecord[index]!.push(item)
  } else {
    nextRecord[index] = [item]
  }

  return nextRecord
}
