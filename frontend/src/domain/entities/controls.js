export const controlType = {
  SEA: 'Contrôle à la mer',
  LAND: 'Contrôle à la débarque',
  AERIAL: 'Contrôle aérien'
}

export const lastControlByType = (yearsToControls) => {
  const lastControlList = {}
  let i = 0
  const sortedLastYearControlList = Object.values(yearsToControls).flat()
    .sort((a, b) => a.controlDatetimeUtc > b.controlDatetimeUtc)
  while (i < sortedLastYearControlList.length && Object.keys(lastControlList).length < 2) {
    if (sortedLastYearControlList[i].controlType === controlType.SEA) {
      lastControlList[controlType.SEA] = {
        control: sortedLastYearControlList[i],
        text: 'Dernier contrôle en mer'
      }
    } else if (sortedLastYearControlList[i].controlType === controlType.LAND) {
      lastControlList[controlType.LAND] = {
        control: sortedLastYearControlList[i],
        text: 'Dernier contrôle à la débarque'
      }
    }
    i++
  }
  return lastControlList
}