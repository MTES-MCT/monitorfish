import * as Comlink from 'comlink'

// eslint-disable-next-line import/no-unresolved
import Worker from './MonitorFishWebWorker?worker'

const worker = new Worker()
export const MonitorFishWorker = Comlink.wrap(worker)
