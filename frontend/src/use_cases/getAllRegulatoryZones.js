import {getAllRegulatoryZonesFromAPI} from "../api/fetch";
import * as Comlink from 'comlink'
/* eslint-disable import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../workers/MapperWorker';

const worker = new Worker();
const MapperWorker = Comlink.wrap(worker);

const getAllRegulatoryZones = () => async () => {
    const worker = await new MapperWorker()

    return getAllRegulatoryZonesFromAPI()
        .then(features => {
            return worker.convertGeoJSONFeaturesToObject(features)
        })
}

export default getAllRegulatoryZones
