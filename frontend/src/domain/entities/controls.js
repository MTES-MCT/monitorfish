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
      lastControlList.SEA = {
        control: sortedLastYearControlList[i],
        text: 'Dernier contrôle en mer'
      }
    } else if (sortedLastYearControlList[i].controlType === controlType.LAND) {
      lastControlList.LAND = {
        control: sortedLastYearControlList[i],
        text: 'Dernier contrôle à la débarque'
      }
    }
    i++
  }
  return lastControlList
}

export const getYearsToControl = (controlsFromDate, controls) => {
  const nextYearsToControls = {}
  if (controlsFromDate) {
    let fromYear = controlsFromDate.getUTCFullYear() + 1
    while (fromYear < new Date().getUTCFullYear()) {
      nextYearsToControls[fromYear] = []
      fromYear += 1
    }
  }

  controls.forEach(control => {
    if (control && control.controlDatetimeUtc) {
      const year = new Date(control.controlDatetimeUtc).getUTCFullYear()

      if (nextYearsToControls[year] && nextYearsToControls[year].length) {
        nextYearsToControls[year] = nextYearsToControls[year].concat(control)
      } else {
        nextYearsToControls[year] = [control]
      }
    }
  })
  return nextYearsToControls
}
