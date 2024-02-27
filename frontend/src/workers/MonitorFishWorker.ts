import * as Comlink from 'comlink'

import { MonitorFishWebWorker } from './MonitorFishWebWorker'
import Worker from './MonitorFishWebWorker?worker'

const worker = new Worker()
export const MonitorFishWorker = Comlink.wrap<typeof MonitorFishWebWorker>(worker)
