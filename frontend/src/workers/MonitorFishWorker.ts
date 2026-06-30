import * as Comlink from 'comlink'

import { MonitorFishWebWorker } from './MonitorFishWebWorker'
// eslint-disable-next-line import/default -- Vite's `?worker` import provides a default Worker constructor that the static resolver can't see
import Worker from './MonitorFishWebWorker?worker'

const worker = new Worker()
export const MonitorFishWorker = Comlink.wrap<typeof MonitorFishWebWorker>(worker)
