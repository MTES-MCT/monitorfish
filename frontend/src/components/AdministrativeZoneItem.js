import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIconSVG} from "./icons/oeil_affiche.svg";
import {ReactComponent as HideIconSVG} from "./icons/oeil_masque.svg";
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

    return <>{ props.layer ? <Row className={``} onClick={() => setShowLayer(!showLayer_)}>{props.layer.layerName} { showLayer_ ? <ShowIcon /> : <HideIcon />}</Row> : null}</>
}

const Row = styled.span`
  width: 100%;
  display: block;
  line-height: 1.9em;
  padding-left: 10px;
  user-select: none;
`

const ShowIcon = styled(ShowIconSVG)`
  width: 21px;
  padding: 0 15px 0 0;
  height: 1.5em;
  float: right;
`

const HideIcon = styled(HideIconSVG)`
  width: 21px;
  padding: 0 15px 0 0;
  height: 1.5em;
  float: right;
`

export default AdministrativeZoneItem
