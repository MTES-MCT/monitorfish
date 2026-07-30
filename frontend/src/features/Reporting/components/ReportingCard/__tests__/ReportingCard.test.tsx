import { Seafront } from '@constants/seafront'
import { PendingAlertValueType } from '@features/Alert/constants'
import { ReportingCard } from '@features/Reporting/components/ReportingCard'
import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { afterAll, afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { noop } from 'lodash-es'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import type {
  InfractionSuspicionReporting,
  InfractionSuspicionThreat,
  PendingAlertReporting
} from '@features/Reporting/types'
import type { ReactNode } from 'react'

jest.mock('../../../useCases/archiveReporting', () => ({ archiveReporting: jest.fn() }))
jest.mock('../../../../../hooks/useMainAppDispatch', () => ({ useMainAppDispatch: () => {} }))
jest.mock('../../../useCases/deleteReporting', () => ({ deleteReporting: jest.fn() }))
jest.mock('../../../../Vessel/useCases/rendering/renderVesselFeatures', () => ({ renderVesselFeatures: jest.fn() }))
jest.mock('../../../../Alert/apis', () => ({
  useGetAllAlertSpecificationsQuery: () => ({ data: [] })
}))

const CHALUTAGE: InfractionSuspicionThreat = {
  infraction: {
    infraction: 'Chalutage dans les 3 milles',
    infractionCategory: 'FISHING',
    natinfCode: 2610,
    regulation: 'ART.L.945-2 §I AL.1 C.RUR'
  },
  natinfCode: 2610,
  threat: 'Zone de pêche',
  threatCharacterization: 'Pêche en zone interdite'
}

const MAILLAGE: InfractionSuspicionThreat = {
  infraction: {
    infraction: 'Maillage non réglementaire',
    infractionCategory: 'FISHING',
    natinfCode: 23581,
    regulation: 'ART.L.945-4 C.RUR'
  },
  natinfCode: 23581,
  threat: 'Engin de pêche',
  threatCharacterization: 'Engin non réglementaire'
}

function buildInfractionSuspicionReporting(infractions: InfractionSuspicionThreat[]): InfractionSuspicionReporting {
  return {
    cfr: 'FR04504564',
    createdBy: 'LTH',
    creationDate: '2023-10-30T09:10:00Z',
    expirationDate: undefined,
    externalMarker: '',
    flagState: 'ES',
    gearCode: undefined,
    id: 12345,
    imo: undefined,
    infraction: undefined,
    ircs: '',
    isArchived: false,
    isDeleted: false,
    isFishing: undefined,
    isIUU: false,
    lastUpdateDate: '2023-10-30T09:10:00Z',
    latitude: undefined,
    length: undefined,
    longitude: undefined,
    mmsi: undefined,
    reportingDate: '2023-10-30T09:10:00Z',
    type: ReportingType.INFRACTION_SUSPICION,
    underCharter: undefined,
    validationDate: undefined,
    validityOption: undefined,
    value: {
      authorContact: undefined,
      controlUnit: undefined,
      controlUnitId: undefined,
      description: 'Le navire semble pêcher trop près de la côte.',
      dml: undefined,
      infractions,
      numberOfVessels: undefined,
      otherSourceType: undefined,
      reportingSource: ReportingOriginSource.OPS,
      satelliteType: undefined,
      seaFront: Seafront.NAMO,
      title: 'Suspicion de pêche illégale'
    },
    vesselId: 1234568,
    vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
    vesselName: 'A VESSEL'
  }
}

function renderWithProviders(children: ReactNode) {
  const mockStore = configureStore()

  return render(
    <Provider store={mockStore()}>
      <ThemeProvider theme={THEME}>{children}</ThemeProvider>
    </Provider>
  )
}

describe('ReportingCard()', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>

  afterAll(() => {
    // Reset module registry to clear the mock
    jest.resetModules()
  })

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should display all other dates', async () => {
    // Given
    const mockStore = configureStore()
    const store = mockStore({})

    const reporting: PendingAlertReporting = {
      cfr: 'FR04504564',
      createdBy: 'LTH',
      creationDate: '2023-10-30T09:10:00Z',
      expirationDate: undefined,
      externalMarker: '',
      flagState: 'ES',
      gearCode: undefined,
      id: 12345,
      imo: undefined,
      infraction: {
        infraction:
          'Pêche maritime non autorisée dans les eaux territoriales francaise par capitaine de navire communautaire',
        infractionCategory: 'FISHING',
        natinfCode: 2610,
        regulation: 'ART.L.945-2 §I AL.1, ART.L.945-5 1°,2°,3°,4° C.RUR'
      },
      ircs: '',
      isArchived: false,
      isDeleted: false,
      isFishing: undefined,
      isIUU: false,
      lastUpdateDate: '2023-10-30T09:10:00Z',
      latitude: undefined,
      length: undefined,
      longitude: undefined,
      mmsi: undefined,
      reportingDate: '2023-10-30T09:10:00Z',
      type: ReportingType.ALERT,
      underCharter: undefined,
      validationDate: '2023-10-30T15:08:05.845121Z',
      validityOption: undefined,
      value: {
        alertId: 1,
        dml: null,
        name: 'Chalutage des les 3 milles',
        natinfCode: 2610,
        seaFront: Seafront.NAMO,
        threat: 'Famille',
        threatCharacterization: 'Type',
        type: PendingAlertValueType.POSITION_ALERT
      },
      vesselId: 1234568,
      vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      vesselName: 'A VESSEL'
    }

    render(
      <Provider store={store}>
        <ThemeProvider theme={THEME}>
          <ReportingCard
            isArchived={false}
            onEdit={noop}
            otherOccurrencesOfSameAlert={[
              { ...reporting, validationDate: '2024-10-30T15:08:05.845121Z' },
              { ...reporting, validationDate: '2025-10-30T15:08:05.845121Z' }
            ]}
            reporting={reporting}
          />
        </ThemeProvider>
      </Provider>
    )

    const linkElement = screen.getByText(/Voir les dates des autres alertes/i)

    // When
    await userEvent.click(linkElement)

    // Then
    expect(screen.getByText('1ère alerte le 30/10/2025 à 15h08')).toBeDefined()
    expect(screen.getByText('2è alerte le 30/10/2024 à 15h08')).toBeDefined()
  })

  it('should display the threat and the tag of a single infraction', () => {
    // Given
    const reporting = buildInfractionSuspicionReporting([CHALUTAGE])

    // When
    renderWithProviders(
      <ReportingCard isArchived={false} onEdit={noop} otherOccurrencesOfSameAlert={[]} reporting={reporting} />
    )

    // Then
    expect(screen.getByText('Zone de pêche')).toBeDefined()

    const tag = screen.getByText('Pêche en zone interdite / NATINF 2610')
    expect(tag.title).toBe('Zone de pêche - Pêche en zone interdite\n2610 - Chalutage dans les 3 milles')

    // React warns once per faulty element, so each rendered shape must check for its own missing keys
    expect(consoleErrorSpy.mock.calls).toStrictEqual([])
  })

  it('should display a threat and a tag per infraction, each tag scoped to its own infraction', () => {
    // Given
    const reporting = buildInfractionSuspicionReporting([CHALUTAGE, MAILLAGE])

    // When
    renderWithProviders(
      <ReportingCard isArchived={false} onEdit={noop} otherOccurrencesOfSameAlert={[]} reporting={reporting} />
    )

    // Then
    expect(screen.getByText('Zone de pêche')).toBeDefined()
    expect(screen.getByText('Engin de pêche')).toBeDefined()

    const chalutageTag = screen.getByText('Pêche en zone interdite / NATINF 2610')
    expect(chalutageTag.title).toBe('Zone de pêche - Pêche en zone interdite\n2610 - Chalutage dans les 3 milles')

    const maillageTag = screen.getByText('Engin non réglementaire / NATINF 23581')
    expect(maillageTag.title).toBe('Engin de pêche - Engin non réglementaire\n23581 - Maillage non réglementaire')

    expect(consoleErrorSpy.mock.calls).toStrictEqual([])
  })
})
