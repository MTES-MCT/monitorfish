import { expect } from '@jest/globals'
import { THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { act, render } from '@testing-library/react'
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
              value={index}
            />
          </SpeciesTableRow>
        ))}
      </tbody>
    </table>
  )
}

describe('species row keyboard navigation', () => {
  it('moves focus to the row below on ArrowDown', async () => {
    const user = userEvent.setup()

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

    // Row 0 isn't active yet: clicking its cell (mousedown) should mount + focus its input, like a real click.
    const firstRow = document.querySelector('[data-cy="species-onboard-row-0"]') as HTMLElement
    await user.click(firstRow)
    const firstInput = document.getElementById('speciesOnboard[0].declaredWeight') as HTMLInputElement
    expect(firstInput).not.toBeNull()
    act(() => firstInput.focus())
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
})
