import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as ShowIconSVG} from "./icons/oeil_affiche.svg";
import {ReactComponent as HideIconSVG} from "./icons/oeil_masque.svg";
import styled from "styled-components";
import {ReactComponent as CloseIconSVG} from './icons/Croix_grise.svg'
import {ReactComponent as REGPaperSVG} from './icons/reg_paper.svg'
import {ReactComponent as REGPaperDarkSVG} from './icons/reg_paper_dark.svg'
import {COLORS} from "../constants/constants";

const RegulatoryZoneSelectedZone = props => {
    const firstUpdate = useRef(true);
    const [showSubZone, setShowSubZone] = useState(undefined);
    const [metadataIsShown, setMetadataIsShown] = useState(false)

    const showRegulatoryMetadata = subZone => {
        if(!metadataIsShown) {
            props.callShowRegulatorySubZoneMetadata(subZone)
            setMetadataIsShown(true)
        } else {
            props.callCloseRegulatoryZoneMetadata()
            setMetadataIsShown(false)
        }
    }

    useEffect(() => {
        if(props.regulatoryZoneMetadata &&
            props.subZone &&
            (props.subZone.layerName !== props.regulatoryZoneMetadata.layerName ||
            props.subZone.zone !== props.regulatoryZoneMetadata.zone)) {
            setMetadataIsShown(false)
        }
    }, [props.regulatoryZoneMetadata, props.subZone])

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
            <Rectangle vectorLayerStyle={props.vectorLayerStyle}/>
            <SubZoneText
                title={props.subZone.zone ? props.subZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}
                onClick={() => setShowSubZone(!showSubZone)}>
                {props.subZone.zone ? props.subZone.zone.replace(/[_]/g, ' ') : 'AUCUN NOM'}
            </SubZoneText>
            <Icons>
                {
                    metadataIsShown ?
                        <REGPaperDarkIcon title="Fermer la réglementation" onClick={() => showRegulatoryMetadata(props.subZone)}/> :
                        <REGPaperIcon title="Afficher la réglementation" onClick={() => showRegulatoryMetadata(props.subZone)}/>
                }
                { showSubZone ? <ShowIcon title="Cacher la zone" onClick={() => setShowSubZone(!showSubZone)} /> : <HideIcon title="Afficher la zone" onClick={() => setShowSubZone(!showSubZone)} />}
                <CloseIcon title="Supprimer la zone de ma sélection" onClick={() => props.callRemoveRegulatoryZoneFromMySelection(props.subZone)}/>
            </Icons>

        </SubZone>
        )}

const Rectangle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.vectorLayerStyle && props.vectorLayerStyle.getFill() ? props.vectorLayerStyle.getFill().getColor() : COLORS.gray};
  border: 1px solid ${props => props.vectorLayerStyle && props.vectorLayerStyle.getStroke() ? props.vectorLayerStyle.getStroke().getColor() : COLORS.grayDarkerTwo};
  display: inline-block;
  margin-right: 10px;
  margin-left: 2px;
  margin-top: 9px;
`

const Icons = styled.span`
  float: right;
  display: flex;
`

const SubZone = styled.span`
  width: 88%;
  display: flex;
  line-height: 1.9em;
  padding-left: 30px;
  padding-top: 4px;
  padding-bottom: 4px;
  user-select: none;
  font-size: 13px;
  font-weight: 300;
`

const SubZoneText = styled.span`
  width: 63%;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-x: hidden !important;
  vertical-align: bottom;
  padding-bottom: 3px;
  padding-left: 0;
  margin-top: 8px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 12px;
  margin-top: 7px;
`

const REGPaperIcon = styled(REGPaperSVG)`
  width: 17px;
  margin-right: 7px;
  margin-top: 7px;
`

const REGPaperDarkIcon = styled(REGPaperDarkSVG)`
  width: 17px;
  margin-right: 7px;
  margin-top: 7px;
`

const ShowIcon = styled(ShowIconSVG)`
  width: 21px;
  padding: 0 8px 0 0;
  margin-top: 9px;
`

const HideIcon = styled(HideIconSVG)`
  width: 21px;
  padding: 0 8px 0 0;
  margin-top: 9px;
`

export default RegulatoryZoneSelectedZone
