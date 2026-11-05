import * as Comlink from 'comlink'

// eslint-disable-next-line import/no-duplicates -- `?worker` is a distinct Vite module (query import), not a duplicate
import { MonitorFishWebWorker } from './MonitorFishWebWorker'
// eslint-disable-next-line import/default -- Vite's `?worker` import provides a default Worker constructor that the static resolver can't see
import Worker from './MonitorFishWebWorker?worker'

const worker = new Worker()
export const MonitorFishWorker = Comlink.wrap<typeof MonitorFishWebWorker>(worker)
