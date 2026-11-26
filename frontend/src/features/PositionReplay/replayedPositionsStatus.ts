/** The AIS vessels are `undefined` when they are not fetched: they are then not reported as missing. */
export function getNoPositionLabel(
  vmsVessels: readonly unknown[] | undefined,
  aisVessels: readonly unknown[] | undefined
): string | undefined {
  const isVmsEmpty = vmsVessels?.length === 0
  const isAisEmpty = aisVessels?.length === 0
  const isAisFetched = aisVessels !== undefined

  if (isVmsEmpty && (isAisEmpty || !isAisFetched)) {
    return 'Aucune position'
  }
  if (isVmsEmpty) {
    return 'Aucune position VMS'
  }
  if (isAisEmpty) {
    return 'Aucune position AIS'
  }

  return undefined
}
