import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIconSVG} from "./icons/oeil_affiche.svg";
import {ReactComponent as HideIconSVG} from "./icons/oeil_masque.svg";
import styled from "styled-components";
import {ReactComponent as CloseIconSVG} from './icons/Croix_grise.svg'
import {ReactComponent as REGPaperSVG} from './icons/reg_paper.svg'
import {COLORS} from "../constants/constants";

const RegulatoryZoneSelectedZone = props => {
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

        if (showSubZone && props.isReadyToShowRegulatoryZones) {
            props.callShowRegulatoryZone(props.subZone)
        } else {
            props.callHideRegulatoryZone(props.subZone)
        }
    }, [showSubZone, props.isReadyToShowRegulatoryZones])

    return (
        <SubZone>
            <Rectangle />
            <SubZoneText onClick={() => setShowSubZone(!showSubZone)}>{props.subZone.zone}</SubZoneText>
            <Icons>
                <REGPaperIcon onClick={() => props.callShowRegulatorySubZoneMetadata(props.subZone)}/>
                { showSubZone ? <ShowIcon onClick={() => setShowSubZone(!showSubZone)} /> : <HideIcon onClick={() => setShowSubZone(!showSubZone)} />}
                <CloseIcon onClick={() => props.callRemoveRegulatoryZoneFromMySelection(props.subZone)}/>
            </Icons>

        </SubZone>
        )}

const Rectangle = styled.div`
  width: 10px;
  height: 10px;
  background: gray;
  border: 1px solid ${COLORS.grayDarkerThree};
  display: inline-block;
  margin-right: 5px;
`

const Icons = styled.span`
  float: right;
  display: flex;
`

const SubZone = styled.span`
  width: 88%;
  display: block;
  line-height: 1.9em;
  padding-left: 30px;
  padding-top: 6px;
  padding-bottom: 6px;
  user-select: none;
  font-size: 13px;
  font-weight: 300;
`

const SubZoneText = styled.span`
  width: 65%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
  padding-left: 5px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 12px;
  height: 1.5em;
`

const REGPaperIcon = styled(REGPaperSVG)`
  width: 17px;
  margin-right: 7px;
  height: 1.5em;
`

const ShowIcon = styled(ShowIconSVG)`
  width: 21px;
  padding: 0 8px 0 0;
  height: 1.5em;
`

const HideIcon = styled(HideIconSVG)`
  width: 21px;
  padding: 0 8px 0 0;
  height: 1.5em;
`

export default RegulatoryZoneSelectedZone
