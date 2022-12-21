import dayjs from 'dayjs'

export function fillDateRangePicker(label: string, startDate: Date, endDate: Date): void {
  // eslint-disable-next-line cypress/no-assigning-return-values
  const cypressLegendElement = cy.get('fieldset > div > legend').contains(label)
  if (!cypressLegendElement) {
    throw new Error(`Could not find label (legend) element with text "${label}".`)
  }

  const cypressFieldsetElement = cypressLegendElement.parent().parent()
  if (!cypressFieldsetElement) {
    throw new Error(`Could not find fieldset wrapping label (legend) element with text "${label}".`)
  }

  cypressFieldsetElement.find('input').then(inputs => {
    if (inputs.length !== 7 && inputs.length !== 11) {
      throw new Error(
        `Should have found 7 or 11 inputs within label (legend) element with text "${label}" but found ${inputs.length}.`
      )
    }

    const startDateAsDayJs = dayjs(startDate)
    const endDateAsDayJs = dayjs(endDate)
    const hasTimeInput = inputs.length !== 7

    cypressFieldsetElement.get('[aria-label="Jour de début"]').type(startDateAsDayJs.format('DD'))
    cypressFieldsetElement.get('[aria-label="Mois de début"]').type(startDateAsDayJs.format('MM'))
    cypressFieldsetElement.get('[aria-label="Année de début"]').type(startDateAsDayJs.format('YYYY'))

    if (hasTimeInput) {
      cypressFieldsetElement.get('[aria-label="Heure de début"]').type(startDateAsDayJs.format('hh'))
      cypressFieldsetElement.get('[aria-label="Minute de début"]').type(startDateAsDayJs.format('mm'))
    }

    cypressFieldsetElement.get('[aria-label="Jour de fin"]').type(endDateAsDayJs.format('DD'))
    cypressFieldsetElement.get('[aria-label="Mois de fin"]').type(endDateAsDayJs.format('MM'))
    cypressFieldsetElement.get('[aria-label="Année de fin"]').type(endDateAsDayJs.format('YYYY'))

    if (hasTimeInput) {
      cypressFieldsetElement.get('[aria-label="Heure de fin"]').type(endDateAsDayJs.format('hh'))
      cypressFieldsetElement.get('[aria-label="Minute de fin"]').type(endDateAsDayJs.format('mm'))
    }
  })
}
