import { ReportingType } from '@features/Reporting/types/ReportingType'
import { GroupType } from '@features/VesselGroup/types'
import { describe, expect, it } from '@jest/globals'
import { THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'

import { ControlQualityField } from '../ControlQualityField'

import type { MissionActionFormValues } from '../../../types'
import type {
  MissionActionVesselGroup,
  MissionActionReporting
} from '@features/Mission/schemas/MissionActionSnapshotSchema'

const PRIORITY_TARGET_SELECTOR = '[data-cy="mission-action-priority-target"]'

function getPriorityTarget(): HTMLElement {
  const element = document.querySelector(PRIORITY_TARGET_SELECTOR)
  if (!element) {
    throw new Error('Priority target block not found')
  }

  return element as HTMLElement
}

function buildVesselGroup(overrides: Partial<MissionActionVesselGroup> = {}): MissionActionVesselGroup {
  return {
    color: '#FF0000',
    id: 1,
    isPriorityGroup: true,
    name: 'Groupe 1',
    type: GroupType.DYNAMIC,
    ...overrides
  }
}

function buildTripReporting(overrides: Partial<MissionActionReporting> = {}): MissionActionReporting {
  return {
    id: 1,
    threats: [],
    title: 'Suspicion',
    type: ReportingType.INFRACTION_SUSPICION,
    ...overrides
  }
}

function renderControlQualityField(values: Partial<MissionActionFormValues>) {
  render(
    <ThemeProvider theme={THEME}>
      <Formik initialValues={values} onSubmit={() => {}}>
        <ControlQualityField />
      </Formik>
    </ThemeProvider>
  )
}

describe('ControlQualityField', () => {
  it('does not render the priority target block when there is no vessel selected', () => {
    renderControlQualityField({ tripReportings: [], vesselGroups: [] })

    expect(document.querySelector(PRIORITY_TARGET_SELECTOR)).toBeNull()
  })

  it('renders "not a priority target" when the vessel has no priority group and no trip reporting', () => {
    renderControlQualityField({ tripReportings: [], vesselGroups: [], vesselId: 123 })

    expect(screen.getByText('Le navire n’est pas considéré comme une cible prioritaire.')).not.toBeNull()
  })

  it('renders "not a priority target" when the vessel belongs to a non-priority group only', () => {
    renderControlQualityField({
      tripReportings: [],
      vesselGroups: [buildVesselGroup({ isPriorityGroup: false })],
      vesselId: 123
    })

    expect(screen.getByText('Le navire n’est pas considéré comme une cible prioritaire.')).not.toBeNull()
  })

  it('renders a single priority group in the singular, with no trip reporting', () => {
    renderControlQualityField({
      tripReportings: [],
      vesselGroups: [buildVesselGroup({ isPriorityGroup: true, name: 'Groupe A' })],
      vesselId: 123
    })

    const target = getPriorityTarget()
    expect(target.textContent).toBe(
      'Le navire est une cible prioritaire : il appartient au groupe prioritaire “Groupe A”.'
    )
  })

  it('renders several priority groups in the plural, joined with "et"', () => {
    renderControlQualityField({
      tripReportings: [],
      vesselGroups: [
        buildVesselGroup({ id: 1, isPriorityGroup: true, name: 'Groupe A' }),
        buildVesselGroup({ id: 2, isPriorityGroup: true, name: 'Groupe B' })
      ],
      vesselId: 123
    })

    const target = getPriorityTarget()
    expect(target.textContent).toBe(
      'Le navire est une cible prioritaire : il appartient aux groupes prioritaires “Groupe A” et “Groupe B”.'
    )
  })

  it('only counts priority groups, ignoring non-priority ones mixed in', () => {
    renderControlQualityField({
      tripReportings: [],
      vesselGroups: [
        buildVesselGroup({ id: 1, isPriorityGroup: true, name: 'Groupe A' }),
        buildVesselGroup({ id: 2, isPriorityGroup: false, name: 'Groupe B' })
      ],
      vesselId: 123
    })

    const target = getPriorityTarget()
    expect(target.textContent).toBe(
      'Le navire est une cible prioritaire : il appartient au groupe prioritaire “Groupe A”.'
    )
  })

  it('renders a single trip reporting in the singular, with no priority group', () => {
    renderControlQualityField({
      tripReportings: [buildTripReporting({ id: 1 })],
      vesselGroups: [],
      vesselId: 123
    })

    const target = getPriorityTarget()
    expect(target.textContent).toBe(
      'Le navire est une cible prioritaire : une suspicion d’infraction est en cours sur sa marée.'
    )
  })

  it('renders several trip reportings in the plural, using the French number word', () => {
    renderControlQualityField({
      tripReportings: [buildTripReporting({ id: 1 }), buildTripReporting({ id: 2 }), buildTripReporting({ id: 3 })],
      vesselGroups: [],
      vesselId: 123
    })

    const target = getPriorityTarget()
    expect(target.textContent).toBe(
      'Le navire est une cible prioritaire : trois suspicions d’infraction est en cours sur sa marée.'
    )
  })

  it('combines priority groups and trip reportings when both are present', () => {
    renderControlQualityField({
      tripReportings: [buildTripReporting({ id: 1 }), buildTripReporting({ id: 2 })],
      vesselGroups: [buildVesselGroup({ id: 1, isPriorityGroup: true, name: 'Groupe A' })],
      vesselId: 123
    })

    const target = getPriorityTarget()
    expect(target.textContent).toBe(
      'Le navire est une cible prioritaire : il appartient au groupe prioritaire “Groupe A”, et deux suspicions d’infraction est en cours sur sa marée.'
    )
  })
})
