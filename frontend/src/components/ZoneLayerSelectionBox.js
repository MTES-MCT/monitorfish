import React, {useEffect, useRef, useState} from "react";
import ZoneLayerControl from "./layers-control/ZoneLayerControl";
import styled from "styled-components";

const ZoneLayerSelectionBox = props => {
    const [openBox, setOpenBox] = useState(false);
    const firstUpdate = useRef(true);

    useEffect(() => {
        if (openBox === true) {
            firstUpdate.current = false;
        }
    }, [openBox])

    return (
        <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            <Title onClick={() => setOpenBox(!openBox)}>ZONES</Title>
            <List>
                {
                    props.layers.map((layer, index) => {
                        return (
                            <ListItem key={index}>
                                <ZoneLayerControl layer={layer} />
                            </ListItem>
                        )
                    })
                }
            </List>
        </Wrapper>
    )
}

const Wrapper = styled.div`
  position: absolute;
  display: inline-block;
  top: 450px;
  left: 0.5em;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  background-color: rgba(255,255,255,0.4);
  border-radius: 4px;
  border-top-right-radius: 0;
  padding: 3px 3px 3px 3px;
  margin-left: -135px;
  
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'layer-box-opening' : 'layer-box-closing'} 1s ease forwards;

  @keyframes layer-box-opening {
    0%   { margin-left: -135px;   }
    100% { margin-left: 0; }
  }

  @keyframes layer-box-closing {
    0% { margin-left: 0; }
    100%   { margin-left: -135px;   }
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
  margin-left: 64px;
  margin-top: -3px;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`

const List = styled.ul`
  margin: 0;
  background-color: #05055E;
  border-radius: 2px;
  padding: 3px;
`

const ListItem = styled.li`
  padding: 2px 5px 2px 5px;
  margin: 0;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  cursor: pointer;
  margin: 0;
  border-bottom: #767AB2 1px solid;
`

export default ZoneLayerSelectionBox
