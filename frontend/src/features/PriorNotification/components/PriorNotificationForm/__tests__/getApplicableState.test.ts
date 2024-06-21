import { describe, expect, it } from '@jest/globals'

import { PriorNotification } from '../../../PriorNotification.types'
import { getApplicableState } from '../utils'

import type { Undefine } from '@mtes-mct/monitor-ui'

describe('features/PriorNotification/components/PriorNotificationForm/utils > getApplicableState()', () => {
  it(`should return undefined if there is no computed state when creating a manual prior notification`, () => {
    const firstPriorNotificationComputedValues = undefined
    const firstPriorNotificationDetail = undefined // = new prior notification

    const firstResult = getApplicableState(firstPriorNotificationComputedValues, firstPriorNotificationDetail)

    expect(firstResult).toBeUndefined()

    const secondPriorNotificationComputedValues = {
      isInVerificationScope: undefined
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const secondPriorNotificationDetail = undefined // = new prior notification

    const secondResult = getApplicableState(secondPriorNotificationComputedValues, secondPriorNotificationDetail)

    expect(secondResult).toBeUndefined()
  })

  it(`should return the expected computed state if there is one when creating a manual prior notification`, () => {
    const firstPriorNotificationComputedValues = {
      isInVerificationScope: true
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const firstPriorNotificationDetail = undefined // = new prior notification

    const firstResult = getApplicableState(firstPriorNotificationComputedValues, firstPriorNotificationDetail)

    expect(firstResult).toBe(PriorNotification.State.PENDING_VERIFICATION)

    const secondPriorNotificationComputedValues = {
      isInVerificationScope: false
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const secondPriorNotificationDetail = undefined // = new prior notification

    const secondResult = getApplicableState(secondPriorNotificationComputedValues, secondPriorNotificationDetail)

    expect(secondResult).toBe(PriorNotification.State.OUT_OF_VERIFICATION_SCOPE)
  })

  it(`should return the last update state if it's consistent with the computed one when editing a manual prior notification`, () => {
    const firstPriorNotificationComputedValues = {
      isInVerificationScope: true
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const firstPriorNotificationDetail = {
      state: PriorNotification.State.PENDING_VERIFICATION
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const firstResult = getApplicableState(firstPriorNotificationComputedValues, firstPriorNotificationDetail)

    expect(firstResult).toBe(PriorNotification.State.PENDING_VERIFICATION)

    const secondPriorNotificationComputedValues = {
      isInVerificationScope: false
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const secondPriorNotificationDetail = {
      state: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const secondResult = getApplicableState(secondPriorNotificationComputedValues, secondPriorNotificationDetail)

    expect(secondResult).toBe(PriorNotification.State.OUT_OF_VERIFICATION_SCOPE)
  })

  it(`should return the computed state if the last update state is inconsistent with the computed one when editing a manual prior notification`, () => {
    const firstPriorNotificationComputedValues = {
      isInVerificationScope: true
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const firstPriorNotificationDetail = {
      state: PriorNotification.State.OUT_OF_VERIFICATION_SCOPE
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const firstResult = getApplicableState(firstPriorNotificationComputedValues, firstPriorNotificationDetail)

    expect(firstResult).toBe(PriorNotification.State.PENDING_VERIFICATION)

    const secondPriorNotificationComputedValues = {
      isInVerificationScope: false
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const secondPriorNotificationDetail = {
      state: PriorNotification.State.PENDING_VERIFICATION
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const secondResult = getApplicableState(secondPriorNotificationComputedValues, secondPriorNotificationDetail)

    expect(secondResult).toBe(PriorNotification.State.OUT_OF_VERIFICATION_SCOPE)
  })

  it(`should return the last update state if it's a pending send whether it's consistent or not with the computed one when editing a manual prior notification`, () => {
    const firstPriorNotificationComputedValues = {
      isInVerificationScope: true
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const firstPriorNotificationDetail = {
      state: PriorNotification.State.PENDING_SEND
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const firstResult = getApplicableState(firstPriorNotificationComputedValues, firstPriorNotificationDetail)

    expect(firstResult).toBe(PriorNotification.State.PENDING_SEND)

    const secondPriorNotificationComputedValues = {
      isInVerificationScope: false
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const secondPriorNotificationDetail = {
      state: PriorNotification.State.PENDING_SEND
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const secondResult = getApplicableState(secondPriorNotificationComputedValues, secondPriorNotificationDetail)

    expect(secondResult).toBe(PriorNotification.State.PENDING_SEND)
  })

  it(`should return the last update state if it's sent whether it's consistent or not with the computed one when editing a manual prior notification`, () => {
    const firstPriorNotificationComputedValues = {
      isInVerificationScope: true
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const firstPriorNotificationDetail = {
      state: PriorNotification.State.SENT
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const firstResult = getApplicableState(firstPriorNotificationComputedValues, firstPriorNotificationDetail)

    expect(firstResult).toBe(PriorNotification.State.SENT)

    const secondPriorNotificationComputedValues = {
      isInVerificationScope: false
    } as Undefine<PriorNotification.ManualPriorNotificationComputedValues>
    const secondPriorNotificationDetail = {
      state: PriorNotification.State.SENT
    } as PriorNotification.PriorNotificationDetail // = prior notification edition

    const secondResult = getApplicableState(secondPriorNotificationComputedValues, secondPriorNotificationDetail)

    expect(secondResult).toBe(PriorNotification.State.SENT)
  })
})
