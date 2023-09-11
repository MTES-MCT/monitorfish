import { expect } from '@jest/globals'
import { render } from '@testing-library/react'

import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionsStage,
  EndOfBeaconMalfunctionReason
} from '../../../../domain/entities/beaconMalfunction/constants'
import { getActionText } from '../beaconMalfunctions'

describe('features/SideWindow/BeaconMalfunctionBoard/beaconMalfunctions.tsx/getActionText()', () => {
  it('should not show the end of malfunction reason when the stage value is not an end column', () => {
    const reason = EndOfBeaconMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED
    const action = {
      beaconMalfunctionId: 9149,
      dateTime: '2022-12-05T07:53:07.39248Z',
      nextValue: BeaconMalfunctionsStage.FOLLOWING,
      previousValue: BeaconMalfunctionsStage.AT_QUAY,
      propertyName: BeaconMalfunctionPropertyName.STAGE
    }

    const result = getActionText(action, reason)

    const { container } = render(result)
    expect(container.textContent).toContain('Le ticket a été déplacé')
    expect(container.textContent).not.toContain('Il a été clôturé pour cause')
  })

  it('should show the end of malfunction reason when the stage value is an end column', () => {
    const reason = EndOfBeaconMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED
    const action = {
      beaconMalfunctionId: 9149,
      dateTime: '2022-12-05T07:53:07.39248Z',
      nextValue: BeaconMalfunctionsStage.ARCHIVED,
      previousValue: BeaconMalfunctionsStage.AT_QUAY,
      propertyName: BeaconMalfunctionPropertyName.STAGE
    }

    const result = getActionText(action, reason)

    const { container } = render(result)
    expect(container.textContent).toContain('Le ticket a été déplacé')
    expect(container.textContent).toContain('Il a été clôturé pour cause')
  })
})
