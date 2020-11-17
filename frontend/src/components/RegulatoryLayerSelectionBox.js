import React, {useContext, useEffect, useRef, useState} from "react";
import styled from 'styled-components';

import {getAllRegulatoryLayerNames} from "../api/fetch";
import {Context} from "../Store";
import RegulatoryLayerControl from "./layers-control/RegulatoryLayerControl";
import RegulatoryLayerSearchBox from "./RegulatoryLayerSearchBox";

const RegulatoryLayerSelectionBox = () => {
    const [_, dispatch] = useContext(Context)
    const [layerNames, setLayerNames] = useState([]);
    const [foundLayerNames, setFoundLayerNames] = useState([]);
    const [openBox, setOpenBox] = useState(false);
    const firstUpdate = useRef(true);

    useEffect(() => {
        if (openBox === true) {
            firstUpdate.current = false;
        }
    }, [openBox])

    useEffect(() => {
        getAllRegulatoryLayerNames(dispatch)
            .then(layerNames => setLayerNames(layerNames))
    }, [])

    return (
        layerNames && layerNames.length > 0 ? <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            <Title onClick={() => setOpenBox(!openBox)}>RÉGLEMENTATION</Title>
            <RegulatoryLayerSearchBox layerNames={layerNames} setFoundLayerNames={setFoundLayerNames}/>
            <List>
                {
                    foundLayerNames.length > 0 ? foundLayerNames.map((layer, index) => {
                    return (<ListItem key={index}><RegulatoryLayerControl layerName={layer}/></ListItem>)
                }) : layerNames.map((layer, index) => {
                        return (<ListItem key={index}><RegulatoryLayerControl layerName={layer}/></ListItem>)
                    })
                }
            </List>
        </Wrapper> : null
    )
}

const Wrapper = styled.div`
  position: absolute;
  display: inline-block;
  top: 70px;
  left: 0.5em;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  background-color: rgba(255,255,255,0.4);
  border-radius: 4px;
  border-top-right-radius: 0;
  padding: 3px 3px 3px 3px;
  margin-left: -210px;
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'regulatory-box-opening' : 'regulatory-box-closing'} 1s ease forwards;

  @keyframes regulatory-box-opening {
    0%   { margin-left: -210px;   }
    100% { margin-left: 0; }
  }

  @keyframes regulatory-box-closing {
    0% { margin-left: 0; }
    100%   { margin-left: -210px;   }
  }
`

const Title = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  font-size: 0.8em;
  font-weight: bolder;
  writing-mode: vertical-rl;
  text-orientation: sideways;
  background-color: rgba(255,255,255,0.4);
  padding: 3px 1px 3px 1px;
  margin-left: 102px;
  margin-top: -3px;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`

const List = styled.ul`
  margin: 0;
  background-color: #05055E;
  border-radius: 2px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  padding: 3px;
  max-height: 300px;
  overflow-y: scroll;
  overflow-x: hidden;
`

const ListItem = styled.li`
  padding: 2px 5px 2px 5px;
  margin: 0;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  width: 170px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  margin: 0;
  border-bottom: #767AB2 1px solid; 
`

export default RegulatoryLayerSelectionBox
