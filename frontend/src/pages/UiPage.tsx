/* eslint-disable no-null/no-null, sort-keys-fix/sort-keys-fix */

import { useState } from 'react'
import { createGlobalStyle } from 'styled-components'

import { DateRangePicker } from '../ui/DateRangePicker'

import type { DateRange } from '../types'

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    overflow: auto;
  }

  body {
    background-color: #eeeeee;
    padding: 1rem;
  }

  h1 {
    margin-bottom: 1rem;
  }

  h2 {
    border-bottom: solid 1px lightgray;
    margin-bottom: 1rem;
  }

  h3 {
    line-height: 1;
    margin-bottom: 2rem;
    margin-top: 0;
  }

  h4 {
    margin-top: 1rem;
  }

  section {
    background-color: white;
    border: dashed 1px lightgray;
    margin-top: 1rem;
    padding: 1rem;
  }

  pre {
    font-size: 100%;
  }

  /* Hide Webpack dev server error overlay */
  #webpack-dev-server-client-overlay {
    display: none;
  }
`

export function UiPage() {
  const [dateRangePickerOutput, setDateRangePickerOutput] = useState<DateRange>()
  const [dateRangePickerWithTimeOutput, setDateRangePickerithTimeOutput] = useState<DateRange>()

  return (
    <>
      <GlobalStyle />

      <h1>UI Showcase</h1>

      <h2>Date Range Picker</h2>

      <section>
        <h3>Default</h3>
        <DateRangePicker label="A date range picker" onChange={setDateRangePickerOutput} />
        <h4>Output</h4>
        <pre>
          <code>
            {dateRangePickerOutput &&
              JSON.stringify(
                {
                  startDate: dateRangePickerOutput[0].toISOString(),
                  endDate: dateRangePickerOutput[1].toISOString()
                },
                null,
                2
              )}
          </code>
        </pre>
      </section>

      <section>
        <h3>With time</h3>
        <DateRangePicker label="A date range picker with time" onChange={setDateRangePickerithTimeOutput} withTime />
        <h4>Output</h4>
        <pre>
          <code>
            {dateRangePickerWithTimeOutput &&
              JSON.stringify(
                {
                  startDate: dateRangePickerWithTimeOutput[0].toISOString(),
                  endDate: dateRangePickerWithTimeOutput[1].toISOString()
                },
                null,
                2
              )}
          </code>
        </pre>
      </section>
    </>
  )
}
