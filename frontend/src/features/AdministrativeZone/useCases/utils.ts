export function getLayerNameFromTypeAndZone(type: string, zone: string | undefined): string {
  if (!zone) {
    return type
  }

  return `${type}:${zone}`
}
