import { expect } from '@jest/globals'
import { THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'

import { SpeciesTableRow, WeightCell } from '../SpeciesTableRow'
import { useRowActivation } from '../useRowActivation'

function Harness() {
  const activation = useRowActivation()
  const rowCount = 3

  const navigate = (fieldKey: string, currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= rowCount) {
      return
    }

    activation.activateRowForNavigation(targetIndex)
    activation.requestFocus(`speciesOnboard[${targetIndex}].${fieldKey}`)
  }

  return (
    <table>
      <tbody>
        {[0, 1, 2].map(index => (
          <SpeciesTableRow
            key={index}
            activation={activation}
            dataCy={`species-onboard-row-${index}`}
            index={index}
            isHovered={activation.hoveredIndex === index}
          >
            <WeightCell
              clearFocusRequest={activation.clearFocusRequest}
              focusRequestId={activation.focusRequestId}
              isActive={activation.isRowActive(index)}
              isDisabled={false}
              isHovered={activation.hoveredIndex === index}
              label="Qté déclarée"
              name={`speciesOnboard[${index}].declaredWeight`}
              onNavigateRow={direction => navigate('declaredWeight', index, direction)}
            />
          </SpeciesTableRow>
        ))}
      </tbody>
    </table>
  )
}

function renderTable() {
  render(
    <ThemeProvider theme={THEME}>
      <Formik
        initialValues={{
          speciesOnboard: [{ declaredWeight: 0 }, { declaredWeight: 1 }, { declaredWeight: 2 }]
        }}
        onSubmit={() => {}}
      >
        <Harness />
      </Formik>
    </ThemeProvider>
  )
}

describe('species row keyboard navigation', () => {
  it('moves focus to the row below on ArrowDown', async () => {
    const user = userEvent.setup()

    renderTable()

    const firstInput = document.getElementById('speciesOnboard[0].declaredWeight') as HTMLInputElement
    expect(firstInput).not.toBeNull()
    await user.click(firstInput)
    expect(document.activeElement).toBe(firstInput)

    await user.keyboard('{ArrowDown}')

    const secondInput = document.getElementById('speciesOnboard[1].declaredWeight') as HTMLInputElement
    expect(secondInput).not.toBeNull()
    expect(document.activeElement).toBe(secondInput)

    // A second hop shouldn't strand row 1 (regression check for it losing its active state entirely).
    await user.keyboard('{ArrowDown}')

    const thirdInput = document.getElementById('speciesOnboard[2].declaredWeight') as HTMLInputElement
    expect(thirdInput).not.toBeNull()
    expect(document.activeElement).toBe(thirdInput)

    await user.keyboard('{ArrowUp}')
    expect(document.activeElement?.id).toBe('speciesOnboard[1].declaredWeight')
  })

  it('does not crash when hovering a different row while another row has real DOM focus', async () => {
    const user = userEvent.setup()

    renderTable()

    const firstInput = document.getElementById('speciesOnboard[0].declaredWeight') as HTMLInputElement
    await user.click(firstInput)
    expect(document.activeElement).toBe(firstInput)

    // Hovers a different row while row 0's input is still genuinely focused.
    const secondRow = document.querySelector('[data-cy="species-onboard-row-1"]') as HTMLElement
    await user.hover(secondRow)

    // Row 0 should stay open (real focus preserved) and row 1 should not blow up the whole table.
    expect(document.getElementById('speciesOnboard[0].declaredWeight')).not.toBeNull()
    expect(document.querySelector('[data-cy="species-onboard-row-1"]')).not.toBeNull()
    expect(document.querySelector('[data-cy="species-onboard-row-2"]')).not.toBeNull()
  })
})

describe('species weight cell', () => {
  it('takes the caret on the very first click, on a row that was never hovered', async () => {
    const user = userEvent.setup()

    renderTable()

    const input = document.getElementById('speciesOnboard[1].declaredWeight') as HTMLInputElement
    expect(input).not.toBeNull()

    await user.click(input)

    expect(document.activeElement).toBe(input)
    // Row 1 starts prefilled with `1`, so a caret that really landed in the input appends to it.
    await user.keyboard('12')
    expect(input.value).toBe('112')
  })

  it('keeps taking keystrokes once the cursor has left the row', async () => {
    const user = userEvent.setup()

    renderTable()

    const input = document.getElementById('speciesOnboard[0].declaredWeight') as HTMLInputElement
    await user.click(input)
    await user.clear(input)
    await user.keyboard('4')

    await user.unhover(document.querySelector('[data-cy="species-onboard-row-0"]') as HTMLElement)
    await user.keyboard('71')

    // Same element throughout: leaving the row must not swap the input back out for read-only text.
    expect(document.getElementById('speciesOnboard[0].declaredWeight')).toBe(input)
    expect(document.activeElement).toBe(input)
    expect(input.value).toBe('471')
  })
})
