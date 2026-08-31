type Persist<Payload, Result> = (payload: Payload) => Promise<Result>

type RequestedSave<Payload, Result> = {
  payload: Payload
  persist: Persist<Payload, Result>
}

/**
 * Runs a single save per key at a time. A save requested while one is running supersedes the one
 * waiting before it, since only the latest payload is worth persisting: the request rate is capped
 * at one round-trip per key, whatever the typing rhythm.
 */
export function createLatestOnlySaver<Payload, Result>() {
  const runningSaveByKey = new Map<string, Promise<Result>>()
  const latestSaveByKey = new Map<string, RequestedSave<Payload, Result>>()

  /** Claiming the save before awaiting it leaves the slot free for the ones requested meanwhile. */
  function claimLatestSave(key: string): RequestedSave<Payload, Result> | undefined {
    const latestSave = latestSaveByKey.get(key)
    latestSaveByKey.delete(key)

    return latestSave
  }

  async function saveUntilCaughtUp(key: string, requestedSave: RequestedSave<Payload, Result>): Promise<Result> {
    const result = await requestedSave.persist(requestedSave.payload)
    const latestSave = claimLatestSave(key)

    return latestSave ? saveUntilCaughtUp(key, latestSave) : result
  }

  return {
    reset() {
      runningSaveByKey.clear()
      latestSaveByKey.clear()
    },

    save(key: string, payload: Payload, persist: Persist<Payload, Result>): Promise<Result> {
      const requestedSave = { payload, persist }

      const runningSave = runningSaveByKey.get(key)
      if (runningSave) {
        latestSaveByKey.set(key, requestedSave)

        return runningSave
      }

      const startedSave = saveUntilCaughtUp(key, requestedSave).finally(() => runningSaveByKey.delete(key))
      runningSaveByKey.set(key, startedSave)

      return startedSave
    }
  }
}
