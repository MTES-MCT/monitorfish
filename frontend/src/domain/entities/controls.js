export const controlType = {
  SEA: 'Contrôle à la mer',
  LAND: 'Contrôle à la débarque',
  AERIAL: 'Contrôle aérien'
}

/**
 * Get last SEA and LAND controls
 * @param {Object<string, VesselControl[]>} yearsToControls
 * @returns {LastControls} The last controls
 */
export const lastControlByType = yearsToControls => {
  const seaControlText = 'Dernier contrôle en mer'
  const landControlText = 'Dernier contrôle à la débarque'

  const lastControlList = {}
  const sortedLastYearControlList = Object.values(yearsToControls).flat()
    .sort((a, b) => a.controlDatetimeUtc < b.controlDatetimeUtc)

  let i = 0
  while (i < sortedLastYearControlList.length && Object.keys(lastControlList).length < 2) {
    if (sortedLastYearControlList[i].controlType === controlType.SEA && !lastControlList.SEA) {
      lastControlList.SEA = {
        control: sortedLastYearControlList[i],
        text: seaControlText
      }
    } else if (sortedLastYearControlList[i].controlType === controlType.LAND && !lastControlList.LAND) {
      lastControlList.LAND = {
        control: sortedLastYearControlList[i],
        text: landControlText
      }
    }

    i++
  }

  if (!lastControlList.SEA) {
    lastControlList.SEA = {
      control: null,
      text: seaControlText
    }
  }

  if (!lastControlList.LAND) {
    lastControlList.LAND = {
      control: null,
      text: landControlText
    }
  }

  return lastControlList
}

/**
 * Get controls for each years : Years are keys and controls are values
 * @param {string} controlsFromDate - The date
 * @param {VesselControl[]} controls
 * @returns {Object.<string, VesselControl[]>} The controls for all years
 */
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

/**
 * Get the number of infractions in a control - Take care of infractions without NATINF
 * 
 * If infractions are specified in the infractions list, then the number of infractions of the length of the list is returned
 * If the infraction boolean is true and no infractions are specified, then the number of infractions returned is 1
 * @param {VesselControl} control
 * @returns {number} The number of infractions
 */
export const getNumberOfInfractions = control => {
  if (control && control.infractions && control.infractions.length) {
    return control.infractions.length
  } else if (control && control.infraction && !control.infractions.length) {
    return 1
  }

  return 0
}
