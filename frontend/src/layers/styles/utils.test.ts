import { describe, expect, it } from '@jest/globals'

import { theme } from '../../ui/theme'
import { getColorWithAlpha } from './utils'

describe('utils', () => {
  it('getColorWithAlpha Should add the alpha field on a color', async () => {
    // Given
    const color = theme.color.indigoDye

    // When
    expect(getColorWithAlpha(color, 0.5)).toEqual('rgba(3,62,84,0.5)')
  })
})
