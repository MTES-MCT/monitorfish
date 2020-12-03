import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIcon} from "../../components/icons/eye.svg";
import {ReactComponent as HideIcon} from "../../components/icons/eye_not.svg";
import {useDispatch} from "react-redux";
import {hideLayer, showLayer} from "../../reducers/Layer";

const ZoneLayerControl = props => {
    const dispatch = useDispatch()
    const firstUpdate = useRef(true);
    const [_showLayer, setShowLayer] = useState(false);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        let payload = { type: props.layer.layer };
        if(_showLayer) {
            dispatch(showLayer(payload));
        } else {
            dispatch(hideLayer(payload));
        }
    }, [_showLayer])

    return (<span className={``} onClick={() => setShowLayer(!_showLayer)}>{props.layer.layerName} { _showLayer ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}</span>)
}

export default ZoneLayerControl
