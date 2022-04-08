import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!./MonitorFishWebWorker'

const worker = new Worker()
export const MonitorFishWorker = Comlink.wrap(worker)
