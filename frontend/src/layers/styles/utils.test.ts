import { describe, expect, it } from '@jest/globals'

import { theme } from '../../ui/theme'
import { getColorWithAlpha } from './utils'

describe('utils', () => {
  it('getColorWithAlpha Should add the alpha field on a color', async () => {
    // Given
    const color = theme.color.lightBlue

    // When
    expect(getColorWithAlpha(color, 0.5)).toEqual('rgba(185,221,229,0.5)')
  })

  it('getColorWithAlpha Should add the alpha field on a color When the prussianBlue color is used', async () => {
    // Given
    const color = theme.color.prussianBlue

    // When
    expect(getColorWithAlpha(color, 0.75)).toEqual('rgba(0,52,84,0.75)')
  })
})
