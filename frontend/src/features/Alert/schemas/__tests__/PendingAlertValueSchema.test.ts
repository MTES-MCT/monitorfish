import { Seafront } from '@constants/seafront'
import { PendingAlertValueType } from '@features/Alert/constants'
import { PendingAlertValueSchema } from '@features/Alert/schemas/PendingAlertValueSchema'
import { expect } from '@jest/globals'

describe('features/Alert/schemas/PendingAlertValueSchema', () => {
  const anAlertValue = {
    name: 'Pêche en zone interdite',
    natinfCode: 2608,
    threat: 'Activités INN',
    threatCharacterization: 'Pêche sans autorisation par navire tiers',
    type: PendingAlertValueType.POSITION_ALERT
  }

  /**
   * `Polynésie et Clipperton` was split into `Polynésie Française` and `Clipperton`, but the pipeline writes
   * `facade_areas_subdivided.facade` into `value.seaFront` untranslated, so the legacy label still reaches us.
   */
  it('should accept the legacy `Polynésie et Clipperton` seafront', () => {
    const result = PendingAlertValueSchema.safeParse({ ...anAlertValue, seaFront: 'Polynésie et Clipperton' })

    expect(result.success).toBe(true)
    expect(result.data?.seaFront).toBe(Seafront.POLYNESIE_ET_CLIPPERTON)
  })

  it('should reject an unknown seafront', () => {
    const result = PendingAlertValueSchema.safeParse({ ...anAlertValue, seaFront: 'Atlantide' })

    expect(result.success).toBe(false)
  })
})
