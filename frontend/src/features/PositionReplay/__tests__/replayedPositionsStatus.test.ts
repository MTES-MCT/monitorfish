import { describe, expect, it } from '@jest/globals'

import { getNoPositionLabel } from '../replayedPositionsStatus'

const VESSELS = [{}]

describe('PositionReplay/getNoPositionLabel()', () => {
  it('Should report no position When neither VMS nor AIS positions are found', () => {
    expect(getNoPositionLabel([], [])).toEqual('Aucune position')
  })

  it('Should report no position When no VMS position is found and AIS vessels are not fetched', () => {
    expect(getNoPositionLabel([], undefined)).toEqual('Aucune position')
  })

  it('Should report the missing VMS positions When only AIS positions are found', () => {
    expect(getNoPositionLabel([], VESSELS)).toEqual('Aucune position VMS')
  })

  it('Should report the missing AIS positions When only VMS positions are found', () => {
    expect(getNoPositionLabel(VESSELS, [])).toEqual('Aucune position AIS')
  })

  it('Should report nothing When positions are found', () => {
    expect(getNoPositionLabel(VESSELS, VESSELS)).toBeUndefined()
    expect(getNoPositionLabel(VESSELS, undefined)).toBeUndefined()
  })

  it('Should only report the AIS positions When VMS positions are not loaded yet', () => {
    expect(getNoPositionLabel(undefined, [])).toEqual('Aucune position AIS')
  })
})
