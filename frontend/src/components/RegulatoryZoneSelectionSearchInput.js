import React, {useEffect, useState} from "react";
import styled from 'styled-components';

const RegulatoryZoneSelectionSearchInput = props => {
    const [placeSearchText, setPlaceSearchText] = useState('');

    useEffect(() => {
        if (placeSearchText.length > 1 && props.regulatoryZones) {
            let regulatoryZones = {...props.regulatoryZones}
            Object.keys(regulatoryZones)
                .forEach(key => {
                    regulatoryZones[key] = regulatoryZones[key]
                        .filter(zone => {
                            return zone.zone ? zone.zone.toLowerCase().includes(placeSearchText.toLowerCase()) : false
                        })

                    if (!regulatoryZones[key] || !regulatoryZones[key].length > 0) {
                        delete regulatoryZones[key]
                    }
                })

            props.setFoundRegulatoryZones(regulatoryZones)
        } else {
            props.setFoundRegulatoryZones({})
        }
    }, [placeSearchText, props.regulatoryZones])

    return (
        <SearchBox showRegulatorySearchInput={props.showRegulatorySearchInput}>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Zone (ex. Bretagne, Charente...)'} onChange={e => setPlaceSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Engin (ex. chalut, OTB...)'} onChange={e => setPlaceSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Espèce (ex. Bivalve, HKE...)'} onChange={e => setPlaceSearchText(e.target.value)}/>
            <SearchBoxInput type="text" value={placeSearchText} placeholder={'Réglementation (ex. 2018-171)'} onChange={e => setPlaceSearchText(e.target.value)}/>
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

export default RegulatoryZoneSelectionSearchInput
