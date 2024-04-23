export const getTime = (dateString: string, withoutSeconds: boolean) => {
  const date = new Date(dateString)

  let time = date.toLocaleTimeString([], {
    hour: '2-digit',
    hourCycle: 'h24',
    minute: '2-digit',
    second: withoutSeconds ? undefined : '2-digit',
    timeZone: 'UTC'
  })
  time = time.replace(':', 'h')
  time = time.replace('24h', '00h')

  return time
}
