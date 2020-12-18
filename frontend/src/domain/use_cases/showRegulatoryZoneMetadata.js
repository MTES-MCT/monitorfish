import {getRegulatoryZoneMetadataFromAPI} from "../../api/fetch";
import {
    closeRegulatoryZoneMetadataPanel,
    setLoadingRegulatoryZoneMetadata,
    setRegulatoryZoneMetadata
} from "../reducers/Regulatory";
import {mapToRegulatoryZone} from "../entities/regulatory";
import {setError} from "../reducers/Global";

const showRegulatoryZoneMetadata = regulatoryZone => dispatch => {
    if(regulatoryZone){
        dispatch(setLoadingRegulatoryZoneMetadata())
        getRegulatoryZoneMetadataFromAPI(regulatoryZone).then(regulatoryZoneProperties => {
            let regulatoryZone = mapToRegulatoryZone(regulatoryZoneProperties)
            dispatch(setRegulatoryZoneMetadata(regulatoryZone))
        }).catch(error => {
            dispatch(closeRegulatoryZoneMetadataPanel())
            dispatch(setError(error));
        });
    }
}

export default showRegulatoryZoneMetadata
