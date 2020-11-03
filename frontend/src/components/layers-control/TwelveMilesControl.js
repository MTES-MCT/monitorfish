import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../../Store";
import Layers from "../../domain/enum"
import {ReactComponent as ShowIcon} from "../icons/eye.svg";
import {ReactComponent as HideIcon} from "../icons/eye_not.svg";

const TwelveMilesControl = () => {
    const [_, dispatch] = useContext(Context)
    const firstUpdate = useRef(true);
    const [showLayer, setShowLayer] = useState(false);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if(showLayer) {
            dispatch({type: 'SHOW_LAYER', payload: Layers.TWELVE_MILES});
        } else {
            dispatch({type: 'HIDE_LAYER', payload: Layers.TWELVE_MILES});
        }
    }, [showLayer])

    return (<span className={``} onClick={() => setShowLayer(!showLayer)}>12 Milles { showLayer ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}</span>)
}

export default TwelveMilesControl
