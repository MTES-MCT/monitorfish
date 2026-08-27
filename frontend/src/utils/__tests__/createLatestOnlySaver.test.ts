import { describe, expect, it } from '@jest/globals'

import { createLatestOnlySaver } from '../createLatestOnlySaver'

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(internalResolve => {
    resolve = internalResolve
  })

  return { promise, resolve }
}

describe('createLatestOnlySaver()', () => {
  it('Should run a save immediately when nothing is running for that key', async () => {
    // Given
    const saver = createLatestOnlySaver<string, string>()

    // When
    const result = await saver.save('a', 'first', payload => Promise.resolve(`saved ${payload}`))

    // Then
    expect(result).toBe('saved first')
  })

  it('Should keep only the latest payload of the edits made while a save is running', async () => {
    // Given
    const saver = createLatestOnlySaver<string, string>()
    const firstSave = createDeferred<string>()
    const savedPayloads: string[] = []
    const saveOne = (payload: string) => {
      savedPayloads.push(payload)

      return payload === 'first' ? firstSave.promise : Promise.resolve(`saved ${payload}`)
    }

    // When: three more edits happen while the first save is still running
    const running = saver.save('a', 'first', saveOne)
    const queuedFirst = saver.save('a', 'second', saveOne)
    const queuedSecond = saver.save('a', 'third', saveOne)
    const queuedLast = saver.save('a', 'fourth', saveOne)
    firstSave.resolve('saved first')

    // Then: the intermediate payloads are dropped, only the latest one is saved
    await Promise.all([running, queuedFirst, queuedSecond, queuedLast])
    expect(savedPayloads).toEqual(['first', 'fourth'])
  })

  it('Should give every caller the result of the last save', async () => {
    // Given
    const saver = createLatestOnlySaver<string, string>()
    const firstSave = createDeferred<string>()

    // When
    const running = saver.save('a', 'first', payload =>
      payload === 'first' ? firstSave.promise : Promise.resolve(`saved ${payload}`)
    )
    const queued = saver.save('a', 'second', payload => Promise.resolve(`saved ${payload}`))
    firstSave.resolve('saved first')

    // Then
    expect(await running).toBe('saved second')
    expect(await queued).toBe('saved second')
  })

  it('Should not coalesce the saves of two different keys', async () => {
    // Given
    const saver = createLatestOnlySaver<string, string>()
    const savedPayloads: string[] = []
    const saveOne = (payload: string) => {
      savedPayloads.push(payload)

      return Promise.resolve(payload)
    }

    // When
    await Promise.all([saver.save('a', 'a-payload', saveOne), saver.save('b', 'b-payload', saveOne)])

    // Then
    expect(savedPayloads).toEqual(['a-payload', 'b-payload'])
  })

  it('Should run the next save normally once the running one is done', async () => {
    // Given
    const saver = createLatestOnlySaver<string, string>()
    const savedPayloads: string[] = []
    const saveOne = (payload: string) => {
      savedPayloads.push(payload)

      return Promise.resolve(payload)
    }

    // When
    await saver.save('a', 'first', saveOne)
    await saver.save('a', 'second', saveOne)

    // Then
    expect(savedPayloads).toEqual(['first', 'second'])
  })
})
