import { Seafront } from '@constants/seafront'
import { ReportingCard } from '@features/Reporting/components/VesselReportings/ReportingCard'
import { ReportingType } from '@features/Reporting/types'
import { afterAll, describe, expect, it } from '@jest/globals'
import { THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PendingAlertValueType } from '../../../../../domain/entities/alerts/types'
import { VesselIdentifier } from '../../../../../domain/entities/vessel/types'

import type { PendingAlertReporting } from '@features/Reporting/types'

// TODO Remove these @ts-ignore
// @ts-ignore
jest.mock('../../../useCases/archiveReporting', () => () => ({ archiveReporting: jest.fn() }))
// @ts-ignore
jest.mock('../../../../../hooks/useMainAppDispatch', () => ({ useMainAppDispatch: () => {} }))

describe('ReportingCard()', () => {
  afterAll(() => {
    // Reset module registry to clear the mock
    // @ts-ignore
    jest.resetModules()
  })

  it('should display all other dates', async () => {
    // Given
    const reporting: PendingAlertReporting = {
      creationDate: '2023-10-30T09:10:00Z',
      externalReferenceNumber: '',
      flagState: 'ES',
      id: 12345,
      infraction: {
        infraction:
          'Pêche maritime non autorisée dans les eaux territoriales francaise par capitaine de navire communautaire',
        infractionCategory: 'FISHING',
        natinfCode: 2610,
        regulation: 'ART.L.945-2 §I AL.1, ART.L.945-5 1°,2°,3°,4° C.RUR'
      },
      internalReferenceNumber: 'FR04504564',
      ircs: '',
      isArchived: false,
      isDeleted: false,
      type: ReportingType.ALERT,
      underCharter: null,
      validationDate: '2023-10-30T15:08:05.845121Z',
      value: {
        dml: null,
        natinfCode: 2610,
        seaFront: Seafront.NAMO,
        type: PendingAlertValueType.TWELVE_MILES_FISHING_ALERT
      },
      vesselId: 1234568,
      vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      vesselName: 'A VESSEL'
    }

    render(
      <ThemeProvider theme={THEME}>
        <ReportingCard
          isArchived={false}
          otherOccurrencesOfSameAlert={[
            { ...reporting, validationDate: '2024-10-30T15:08:05.845121Z' },
            { ...reporting, validationDate: '2025-10-30T15:08:05.845121Z' }
          ]}
          reporting={reporting}
        />
      </ThemeProvider>
    )

    const linkElement = screen.getByRole('link', { name: /Voir les dates des autres alertes/i })

    // When
    await userEvent.click(linkElement)

    // Then
    expect(screen.getByText('1ère alerte le 30/10/2025 à 15h08')).toBeDefined()
    expect(screen.getByText('2è alerte le 30/10/2024 à 15h08')).toBeDefined()
  })
})
