import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIcon} from "./icons/eye.svg";
import {ReactComponent as HideIcon} from "./icons/eye_not.svg";
import styled from "styled-components";
import {ReactComponent as CloseIconSVG} from './icons/Croix_grise.svg'

const RegulatoryZoneSelectedItem = props => {
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

        props.callShowRegulatoryZone()
        /*let payload = { type: props.layer.type, filter: props.layer.filter };
        if(showLayer_) {
            dispatch(showLayer(payload));
        } else {
            dispatch(hideLayer(payload));
        }*/
    }, [showLayer_])

    return (<Row>
        <Zone onClick={() => setShowLayer(!showLayer_)}>
            {props.regulatoryZoneName.replace('_', ' ')}
        </Zone>
        {
            props.regulatorySubZones ? props.regulatorySubZones.map((subZone, index) => {
                return (<SubZone onClick={() => setShowLayer(!showLayer_)} key={index}>
                    <Rectangle />
                    <SubZoneText>{subZone.zone}</SubZoneText>
                    { showLayer_ ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}
                    <CloseIcon onClick={() => props.callRemoveRegulatoryZoneFromMySelection(subZone)}/>
                </SubZone>)
            }) : null
        }
    </Row>)}

const Rectangle = styled.div`
  width: 8px;
  height: 8px;
  background: gray;
  border: 1px solid white;
  display: inline-block;
  margin-right: 5px;
`

const Zone = styled.span`
  width: 100%;
  display: block;
  line-height: 2.7em;
  text-transform: uppercase;
  font-size: smaller;
  padding-left: 10px;
  background: rgb(255, 255, 255, 0);
`

const SubZone = styled.span`
  width: 100%;
  display: block;
  line-height: 1.9em;
  font-size: smaller;
  padding-left: 10px;
  background: rgb(255, 255, 255, 0.1);
  border-top: 1px solid rgb(255, 255, 255, 0.1);
`

const SubZoneText = styled.span`
  width: 70%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
`

const Row = styled.div`
  width: 100%;
  display: block;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 10px;
  float: right;
  margin-right: 7px;
  height: 1.5em;
`

export default RegulatoryZoneSelectedItem
