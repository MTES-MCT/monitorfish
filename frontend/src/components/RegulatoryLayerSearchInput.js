import React, {useEffect, useState} from "react";
import styled from 'styled-components';

const RegulatoryLayerSearchInput = props => {
    const [placeSearchText, setPlaceSearchText] = useState('');

    useEffect(() => {
        if (placeSearchText.length > 1 && props.regulatoryZones) {
            console.log(props.regulatoryZones)
            const foundRegulatoryZones = props.regulatoryZones
                .filter(regulatoryZone => regulatoryZone.layerName.toLowerCase().includes(placeSearchText.toLowerCase()))
                .filter(regulatoryZone => regulatoryZone)

            props.setFoundLayerNames(foundRegulatoryZones)
        } else {
            props.setFoundLayerNames([])
        }
    }, [placeSearchText, props.regulatoryZones])

    return (
        <SearchBox showRegulatorySearchInput={props.showRegulatorySearchInput}>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Morbihan...'} onChange={e => setPlaceSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Engin...'} onChange={e => setPlaceSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Oursins...'} onChange={e => setPlaceSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Réglementation...'} onChange={e => setPlaceSearchText(e.target.value)}/>
        </SearchBox>)
}

const SearchBox = styled.div`
  top: 0.5em;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 0;
  text-align: center;
  margin: 0 0 0 0;
  overflow: hidden;
  height: 0;
  animation: ${props => props.showRegulatorySearchInput ? 'regulatory-input-opening' : 'regulatory-input-closing'} 1s ease forwards;

  @keyframes regulatory-input-opening {
    0%   { height: 0;   }
    100% { height: 104px; }
  }

  @keyframes regulatory-input-closing {
    0%   { height: 104px; }
    100% { height: 0;   }
  }
`;

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  background-color: rgba(255,255,255,0.1);
  border: none;
  border-bottom: 1px #8080802b solid;
  border-radius: 0;
  color: gray;
  font-size: 0.8em;
  height: 25px;
  width: 100%;
  padding: 0 5px 0 5px;
`;

export default RegulatoryLayerSearchInput
