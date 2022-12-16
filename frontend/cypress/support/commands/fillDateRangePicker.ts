import dayjs from 'dayjs'

export function fillDateRangePicker(label: string, startDate: Date, endDate: Date): void {
  // eslint-disable-next-line cypress/no-assigning-return-values
  const cypressLegendElement = cy.get('.DateRangePicker > div > legend').contains(label)
  if (!cypressLegendElement) {
    throw new Error(`Could not find label (legend) element with text "${label}".`)
  }

  const cypressFieldsetElement = cypressLegendElement.parent()
  if (!cypressFieldsetElement) {
    throw new Error(`Could not find fieldset wrapping label (legend) element with text "${label}".`)
  }

  cypressFieldsetElement.find('input').then(inputs => {
    if (inputs.length !== 6 && inputs.length !== 10) {
      throw new Error(
        `Should have found 6 or 10 inputs within label (legend) element with text "${label}" but found ${inputs.length}.`
      )
    }

    const startDateAsDayJs = dayjs(startDate)
    const endDateAsDayJs = dayjs(endDate)
    const hasTimeInput = inputs.length !== 6

    cypressFieldsetElement.getDataCy('date-range-picker-start-day').type(startDateAsDayJs.format('DD'))
    cypressFieldsetElement.getDataCy('date-range-picker-start-month').type(startDateAsDayJs.format('MM'))
    cypressFieldsetElement.getDataCy('date-range-picker-start-year').type(startDateAsDayJs.format('YYYY'))

    if (hasTimeInput) {
      cypressFieldsetElement.getDataCy('date-range-picker-start-hour').type(startDateAsDayJs.format('hh'))
      cypressFieldsetElement.getDataCy('date-range-picker-start-minute').type(startDateAsDayJs.format('mm'))
    }

    cypressFieldsetElement.getDataCy('date-range-picker-end-day').type(endDateAsDayJs.format('DD'))
    cypressFieldsetElement.getDataCy('date-range-picker-end-month').type(endDateAsDayJs.format('MM'))
    cypressFieldsetElement.getDataCy('date-range-picker-end-year').type(endDateAsDayJs.format('YYYY'))

    if (hasTimeInput) {
      cypressFieldsetElement.getDataCy('date-range-picker-end-hour').type(endDateAsDayJs.format('hh'))
      cypressFieldsetElement.getDataCy('date-range-picker-end-minute').type(endDateAsDayJs.format('mm'))
    }
  })
}
