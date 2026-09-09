import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { getPendingStartupNotification } from '../utils'

import type { StartupNotification } from '../types'

const NOW = customDayjs('2026-09-09T00:00:00Z')

const aNotification = (partial: Partial<StartupNotification> = {}): StartupNotification => ({
  body: 'Body',
  for: 'ALL',
  id: 'first',
  title: 'Title',
  ...partial
})

describe('features/StartupNotification/utils.getPendingStartupNotification()', () => {
  it('should return the first non-dismissed notification', () => {
    const notifications = [aNotification({ id: 'first' }), aNotification({ id: 'second' })]

    expect(getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: false, now: NOW })).toEqual(
      notifications[0]
    )
    expect(
      getPendingStartupNotification(notifications, { dismissedIds: ['first'], isSuperUser: false, now: NOW })
    ).toEqual(notifications[1])
  })

  it('should return undefined when all the notifications are dismissed', () => {
    const notifications = [aNotification({ id: 'first' }), aNotification({ id: 'second' })]

    expect(
      getPendingStartupNotification(notifications, {
        dismissedIds: ['first', 'second'],
        isSuperUser: false,
        now: NOW
      })
    ).toBeUndefined()
  })

  it('should return undefined when there is no notification at all', () => {
    expect(getPendingStartupNotification([], { dismissedIds: [], isSuperUser: false, now: NOW })).toBeUndefined()
  })

  it('should only display a CNSP notification to a super user', () => {
    const notifications = [aNotification({ for: 'CNSP' })]

    expect(getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: true, now: NOW })).toEqual(
      notifications[0]
    )
    expect(
      getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: false, now: NOW })
    ).toBeUndefined()
  })

  it('should only display an EXTERNAL notification to a non-super user', () => {
    const notifications = [aNotification({ for: 'EXTERNAL' })]

    expect(getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: false, now: NOW })).toEqual(
      notifications[0]
    )
    expect(
      getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: true, now: NOW })
    ).toBeUndefined()
  })

  it('should display an ALL notification to any user', () => {
    const notifications = [aNotification({ for: 'ALL' })]

    expect(getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: true, now: NOW })).toEqual(
      notifications[0]
    )
    expect(getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: false, now: NOW })).toEqual(
      notifications[0]
    )
  })

  it('should skip a notification which `until` date has passed', () => {
    const notifications = [aNotification({ id: 'expired', until: '2026-09-08' }), aNotification({ id: 'next' })]

    expect(getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: false, now: NOW })).toEqual(
      notifications[1]
    )
  })

  it('should keep a notification which `until` date is in the future', () => {
    const notifications = [aNotification({ id: 'ongoing', until: '2026-09-10' })]

    expect(getPendingStartupNotification(notifications, { dismissedIds: [], isSuperUser: false, now: NOW })).toEqual(
      notifications[0]
    )
  })
})
