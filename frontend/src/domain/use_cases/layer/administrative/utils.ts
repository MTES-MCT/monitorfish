export function getLayerNameFromTypeAndZone(type: string, zone: string | undefined) {
  if (!zone) {
    return type
  }

  return `${type}:${zone}`
}
