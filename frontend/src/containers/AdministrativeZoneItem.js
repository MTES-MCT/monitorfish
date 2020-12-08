import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIcon} from "../components/icons/eye.svg";
import {ReactComponent as HideIcon} from "../components/icons/eye_not.svg";
import {useDispatch} from "react-redux";
import styled from "styled-components";
import showLayer from "../use_cases/showLayer";
import hideLayer from "../use_cases/hideLayer";

const AdministrativeZoneItem = props => {
    const dispatch = useDispatch()
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

        let payload = { type: props.layer.layer };
        if(showLayer_) {
            dispatch(showLayer(payload));
        } else {
            dispatch(hideLayer(payload));
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
