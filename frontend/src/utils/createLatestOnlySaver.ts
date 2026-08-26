type Persist<Payload, Result> = (payload: Payload) => Promise<Result>

type QueuedSave<Payload, Result> = {
  payload: Payload
  persist: Persist<Payload, Result>
}

/**
 * Runs a single save per key at a time. The saves asked for while one is running are superseded by
 * the next one, since only the latest payload is worth persisting: this caps the request rate at one
 * round-trip per key, whatever the typing rhythm, and keeps two saves of a same entity from overlapping.
 */
export function createLatestOnlySaver<Payload, Result>() {
  const runningByKey = new Map<string, Promise<Result>>()
  const queuedByKey = new Map<string, QueuedSave<Payload, Result>>()

  async function runQueuedSaves(key: string): Promise<Result> {
    let result: Result | undefined

    let queued = queuedByKey.get(key)
    while (queued) {
      queuedByKey.delete(key)
      // The saves of a same entity must not overlap, hence the sequential loop
      // eslint-disable-next-line no-await-in-loop
      result = await queued.persist(queued.payload)
      queued = queuedByKey.get(key)
    }

    return result as Result
  }

  return {
    reset() {
      runningByKey.clear()
      queuedByKey.clear()
    },

    save(key: string, payload: Payload, persist: Persist<Payload, Result>): Promise<Result> {
      queuedByKey.set(key, { payload, persist })

      const running = runningByKey.get(key)
      if (running) {
        return running
      }

      const started = runQueuedSaves(key).finally(() => runningByKey.delete(key))
      runningByKey.set(key, started)

      return started
    }
  }
}
