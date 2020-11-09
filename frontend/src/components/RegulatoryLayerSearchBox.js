import React, {useEffect, useRef, useState} from "react";
import {ReactComponent as SearchIconSVG} from './icons/search.svg'
import styled from 'styled-components';

const RegulatoryLayerSearchBox = props => {
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (searchText.length > 1 && props.layerNames) {
            const foundLayerNames = props.layerNames
                .filter(layerName => layerName.toLowerCase().includes(searchText.toLowerCase()))
                .filter(layerName => layerName)

            props.setFoundLayerNames(foundLayerNames)
        } else {
            props.setFoundLayerNames([])
        }
    }, [searchText, props.layerNames])


    return (
        <SearchBox>
            <SearchIcon />
            <SearchBoxInput type="text" value={searchText} placeholder={'Chercher une REG...'} onChange={e => setSearchText(e.target.value)}/>
        </SearchBox>)
}

const SearchBox = styled.div`
  top: 0.5em;
  left: 0.5em;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  background-color: rgba(255,255,255,0.4);
  border-radius: 4px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  text-align: center;
  margin: 0 0 0 0;
`;

const SearchBoxInput = styled.input`
  max-width: 175px;
  margin: 0;
  background-color: #05055E;
  border: none;
  border-radius: 2px;
  color: white;
  font-size: 0.8em;
  height: 25px;
  padding-left: 5px;
`;

const SearchIcon = styled(SearchIconSVG)`
  margin-bottom: -8px;
  margin-right: -2px;
  border-radius: 2px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  width: 25px;
  height: 25px;
  background-color: #05055E;
 `

export default RegulatoryLayerSearchBox
