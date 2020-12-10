import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIcon} from "./icons/eye.svg";
import {ReactComponent as HideIcon} from "./icons/eye_not.svg";
import styled from "styled-components";

const AdministrativeZoneItem = props => {
    const firstUpdate = useRef(true);
    const [showLayer_, setShowLayer] = useState(undefined);

    useEffect(() => {
        if (showLayer_ === undefined) {
            setShowLayer(props.isShownOnInit)
        }
    }, [props.isShownOnInit, showLayer_])

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if(showLayer_) {
            props.callShowAdministrativeZone(props.layer.layer)
        } else {
            props.callHideAdministrativeZone(props.layer.layer)
        }
    }, [showLayer_])

    return <>{ props.layer ? <Row className={``} onClick={() => setShowLayer(!showLayer_)}>{props.layer.layerName} { showLayer_ ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}</Row> : null}</>
}

const Row = styled.span`
  width: 100%;
  display: block;
  line-height: 1.9em;
  padding-left: 10px;
`

export default AdministrativeZoneItem
