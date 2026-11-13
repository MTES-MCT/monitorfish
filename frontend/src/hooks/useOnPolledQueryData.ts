import { useEffect, useRef } from 'react'

type QueryResult<Data, Args> = {
  currentData?: Data | undefined
  originalArgs?: Args | undefined
}

/**
 * Calls `onPolledData` with each new response of a polled RTK query, to copy it to a slice.
 *
 * Not with the response already cached when mounting, nor with the first response of other query arguments:
 * the use case which fetched them already handled them.
 */
export function useOnPolledQueryData<Data, Args>(
  { currentData, originalArgs }: QueryResult<Data, Args>,
  onPolledData: (data: Data) => void
) {
  const argsKey = JSON.stringify(originalArgs)
  const previous = useRef({ argsKey, data: currentData, isFirstResponseOfNewArgs: false })

  useEffect(() => {
    if (argsKey !== previous.current.argsKey) {
      previous.current = { argsKey, data: currentData, isFirstResponseOfNewArgs: currentData === undefined }

      return
    }
    if (currentData === undefined || currentData === previous.current.data) {
      return
    }

    const { isFirstResponseOfNewArgs } = previous.current
    previous.current = { argsKey, data: currentData, isFirstResponseOfNewArgs: false }
    if (!isFirstResponseOfNewArgs) {
      onPolledData(currentData)
    }
  }, [argsKey, currentData, onPolledData])
}
