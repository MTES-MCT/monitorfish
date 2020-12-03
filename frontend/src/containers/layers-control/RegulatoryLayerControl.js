import React, {useEffect, useRef, useState} from "react";
import Layers from "../../domain/layers"
import {ReactComponent as ShowIcon} from "../../components/icons/eye.svg";
import {ReactComponent as HideIcon} from "../../components/icons/eye_not.svg";
import {useDispatch} from "react-redux";
import {hideLayer, showLayer} from "../../reducers/Layer";

const RegulatoryLayerControl = props => {
    const dispatch = useDispatch()
    const firstUpdate = useRef(true);
    const [_showLayer, setShowLayer] = useState(false);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        let payload = { type: Layers.REGULATORY, filter: props.layerName };
        if(_showLayer) {
            dispatch(showLayer(payload));
        } else {
            dispatch(hideLayer(payload));
        }
    }, [_showLayer])

    return (<span className={``} onClick={() => setShowLayer(!_showLayer)}>{props.layerName.replace('_', ' ')} { _showLayer ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}</span>)
}

export default RegulatoryLayerControl
