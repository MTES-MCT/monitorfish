import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../../Store";
import Layers from "../../domain/layers"
import {ReactComponent as ShowIcon} from "../icons/eye.svg";
import {ReactComponent as HideIcon} from "../icons/eye_not.svg";

const ZoneLayerControl = (props) => {
    const [_, dispatch] = useContext(Context)
    const firstUpdate = useRef(true);
    const [showLayer, setShowLayer] = useState(false);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if(showLayer) {
            dispatch({type: 'SHOW_LAYER', payload: { type: props.layer.layer }});
        } else {
            dispatch({type: 'HIDE_LAYER', payload: { type: props.layer.layer }});
        }
    }, [showLayer])

    return (<span className={``} onClick={() => setShowLayer(!showLayer)}>{props.layer.layerName} { showLayer ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}</span>)
}

export default ZoneLayerControl
