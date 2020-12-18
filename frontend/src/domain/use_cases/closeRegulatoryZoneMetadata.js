import {closeRegulatoryZoneMetadataPanel} from "../reducers/Regulatory";

const closeRegulatoryZoneMetadata = () => (dispatch) => {
    dispatch(closeRegulatoryZoneMetadataPanel())
}

export default closeRegulatoryZoneMetadata
