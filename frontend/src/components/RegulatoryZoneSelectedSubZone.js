import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIcon} from "./icons/eye.svg";
import {ReactComponent as HideIcon} from "./icons/eye_not.svg";
import styled from "styled-components";
import {ReactComponent as CloseIconSVG} from './icons/Croix_grise.svg'

const RegulatoryZoneSelectedSubZone = props => {
    const firstUpdate = useRef(true);
    const [showSubZone, setShowSubZone] = useState(undefined);

    useEffect(() => {
        if (showSubZone === undefined) {
            setShowSubZone(props.isShowOnInit)
        }
    }, [props.isShownOnInit])

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if (showSubZone) {
            props.callShowRegulatoryZone(props.subZone)
        } else {
            props.callHideRegulatoryZone(props.subZone)
        }
    }, [showSubZone])

    return (
        <SubZone onClick={() => setShowSubZone(!showSubZone)}>
            <Rectangle />
            <SubZoneText>{props.subZone.zone}</SubZoneText>
            { showSubZone ? <ShowIcon className={'eye'} /> : <HideIcon className={'eye'} />}
            <CloseIcon onClick={() => props.callRemoveRegulatoryZoneFromMySelection(props.subZone)}/>
        </SubZone>
        )}

const Rectangle = styled.div`
  width: 8px;
  height: 8px;
  background: gray;
  border: 1px solid white;
  display: inline-block;
  margin-right: 5px;
`

const SubZone = styled.span`
  width: 100%;
  display: block;
  line-height: 1.9em;
  font-size: smaller;
  padding-left: 10px;
  background: rgb(255, 255, 255, 0.1);
  border-top: 1px solid rgb(255, 255, 255, 0.1);
  user-select: none;
`

const SubZoneText = styled.span`
  width: 70%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 10px;
  float: right;
  margin-right: 7px;
  height: 1.5em;
`

export default RegulatoryZoneSelectedSubZone
