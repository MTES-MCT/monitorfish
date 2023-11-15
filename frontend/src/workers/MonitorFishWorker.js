import * as Comlink from 'comlink'
import Worker from './MonitorFishWebWorker?worker'

const worker = new Worker()
export const MonitorFishWorker = Comlink.wrap(worker)
