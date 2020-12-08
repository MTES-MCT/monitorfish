import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {useDispatch, useSelector} from "react-redux";
import {setError} from "../reducers/Global";

import {getAllRegulatoryZonesFromAPI} from "../api/fetch";
import RegulatoryZoneSelectionItem from "./RegulatoryZoneSelectionItem";
import RegulatoryLayerSearchInput from "../components/RegulatoryLayerSearchInput";
import {ReactComponent as LayersSVG} from '../components/icons/layers.svg';
import {ReactComponent as SearchIconSVG} from '../components/icons/search.svg'
import AdministrativeZoneItem from "./AdministrativeZoneItem";
import addRegulatoryZonesToMySelection from "../use_cases/addRegulatoryZonesToMySelection";
import RegulatoryZoneSelectedItem from "./RegulatoryZoneSelectedItem";
import LayersEnum from "../domain/layers";
import getAllRegulatoryZones from "../use_cases/getAllRegulatoryZones";
import RegulatorySelectionList from "./RegulatorySelectionList";

const LeftSidebar = () => {
    const dispatch = useDispatch()
    const showedLayers = useSelector(state => state.layer.showedLayers)
    const selectedRegulatoryZones = useSelector(state => state.layer.selectedRegulatoryZones)
    const zones = useSelector(state => state.layer.zones)
    const [regulatoryZones, setRegulatoryZones] = useState();
    const [foundRegulatoryZones, setFoundRegulatoryZones] = useState([]);
    const [openBox, setOpenBox] = useState(false);
    const [showRegulatorySection, setShowRegulatorySection] = useState(false);
    const [showRegulatoryZonesSelected, setShowRegulatoryZonesSelected] = useState(true);
    const [showZones, setShowZones] = useState(false);
    const firstUpdate = useRef(true);
    const [regulatoryZonesSelection, setRegulatoryZonesSelection] = useState([])

    useEffect(() => {
        if (openBox === true) {
            firstUpdate.current = false;
        }
    }, [openBox])

    useEffect(() => {
        dispatch(getAllRegulatoryZones())
            .then(regulatoryZones => setRegulatoryZones(regulatoryZones))
            .catch(error => {
                dispatch(setError(error));
            });
    }, [])

    const toggleSelectRegulatoryZone = zoneFilter => {
        let payload = { type: LayersEnum.REGULATORY, filter: zoneFilter };

        if (selectedRegulatoryZones.some(selected => selected.filter === zoneFilter)) {
            setRegulatoryZonesSelection(regulatoryZonesSelection.filter(selectedZone =>
                !(selectedZone.type === payload.type && selectedZone.filter === payload.filter)))
        } else {
            setRegulatoryZonesSelection(regulatoryZonesSelection.concat(payload))
        }
    }

    function callAddRegulatoryZonesToMySelection(regulatoryZonesSelection) {
        dispatch(addRegulatoryZonesToMySelection(regulatoryZonesSelection))
        setRegulatoryZonesSelection([])
    }

    return (
        <Wrapper openBox={openBox} firstUpdate={firstUpdate.current}>
            <SidebarLayersIcon onClick={() => setOpenBox(!openBox)}><Layers/></SidebarLayersIcon>
            <SectionTitle onClick={() => setShowRegulatorySection(!showRegulatorySection)}>
                Rechercher des zones réglementaires
                {
                    showRegulatorySection ? <Close src={'close.png'} /> : <SearchIcon />
                }
            </SectionTitle>
            <RegulatoryLayerSearchInput
                showRegulatorySearchInput={showRegulatorySection}
                regulatoryZones={regulatoryZones}
                setFoundRegulatoryZones={setFoundRegulatoryZones}/>
            <RegulatorySelectionList
                showRegulatorySearchInput={showRegulatorySection}
                foundRegulatoryZones={foundRegulatoryZones}
                showRegulatorySection={showRegulatorySection}
                regulatoryZonesSelection={regulatoryZonesSelection}
                toggleSelectRegulatoryZone={toggleSelectRegulatoryZone}
            />
            <AddRegulatoryLayerButton
                onClick={() => callAddRegulatoryZonesToMySelection(regulatoryZonesSelection)}
                showRegulatorySearchInput={showRegulatorySection}
                foundLayerNames={foundRegulatoryZones}>
                Ajouter à mes zones
            </AddRegulatoryLayerButton>
            <SectionTitle onClick={() => setShowZones(!showZones)}>Zones administratives</SectionTitle>
            <ZonesList showZones={showZones} zonesLength={zones.length}>
                {
                    zones.map((layer, index) => {
                        return (<ListItem key={index}>
                            <AdministrativeZoneItem
                                isShownOnInit={showedLayers.some(layer_ => layer_.type === layer.layer)}
                                layer={layer}
                            />
                        </ListItem>)
                    })
                }
            </ZonesList>
            <SectionTitle onClick={() => {}}>Mes zones</SectionTitle>
            <RegulatorySelectedList showRegulatoryZonesSelected={showRegulatoryZonesSelected}>
                {
                    selectedRegulatoryZones.map((layer, index) => {
                        return (<ListItem key={index}>
                            <RegulatoryZoneSelectedItem
                                layer={layer}
                                isShownOnInit={showedLayers.some(layer_ => layer_.type === layer.layer && layer_.filter && layer_.filter === layer.filter)}
                            />
                        </ListItem>)
                    })
                }
            </RegulatorySelectedList>
        </Wrapper>
    )
}

const AddRegulatoryLayerButton = styled.div`
  cursor: pointer;
  border-radius: 0;
  font-size: 0.8em;
  background: rgba(255, 255, 255, 0.3);
  padding: 0;
  line-height: 1.9em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  animation: ${props => props.showRegulatorySearchInput ? props.foundLayerNames.length > 0 ? 'regulatory-button-opening' : 'regulatory-button-closing' : 'regulatory-button-closing'} 1s ease forwards;

  @keyframes regulatory-button-opening {
    0%   { height: 0;   }
    100% { height: 25px; }
  }

  @keyframes regulatory-button-closing {
    0%   { height: 25px; }
    100% { height: 0;   }
  }
`

const SectionTitle = styled.div`
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: #2F006F;
  font-size: 0.8em;
  padding-top: 10px;
  cursor: pointer;
  font-weight: 500;
  text-align: left;
  padding-left: 10px;
  user-select: none;
`

const Wrapper = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  width: 270px;
  position: absolute;
  display: inline-block;
  top: 50px;
  left: 0;
  z-index: 999999;
  color: white;
  text-decoration: none;
  border: none;
  background-color: rgba(5, 5, 94, 1);
  padding: 0;
  margin-left: -270px;
  height: calc(100vh - 50px);
  
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'regulatory-box-opening' : 'regulatory-box-closing'} 1s ease forwards;

  @keyframes regulatory-box-opening {
    0%   { margin-left: -270px;   }
    100% { margin-left: 0; }
  }

  @keyframes regulatory-box-closing {
    0% { margin-left: 0; }
    100%   { margin-left: -270px;   }
  }
`

const SidebarLayersIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: rgba(5, 5, 94, 1);
  background: linear-gradient(to right, #2F006F, rgba(5, 5, 94, 1));
  padding: 3px 1px 3px 1px;
  margin-left: 135px;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0;
  height: 40px;
  margin-top: 0;
  border-left: none;
    
  :hover, :focus {
    background: linear-gradient(to right, #2F006F, rgba(5, 5, 94, 1));
  }
`

const RegulatorySelectedList = styled.ul`
  margin: 0;
  background-color: #05055E;
  border-radius: 0;
  padding: 0;
  height: 0;
  max-height: 200px;
  overflow-y: scroll;
  overflow-x: hidden;
  
  animation: ${props => props.showRegulatoryZonesSelected ? 'regulatory-selected-opening' : 'regulatory-selected-closing'} 1s ease forwards;

  @keyframes regulatory-selected-opening {
    0%   { height: 0;   }
    100% { height: 200px; }
  }

  @keyframes regulatory-selected-closing {
    0%   { height: 200px; }
    100% { height: 0;   }
  }
`

const ZonesList = styled.ul`
  margin: 0;
  background-color: #05055E;
  border-radius: 0;
  padding: 0;
  height: 0;
  overflow-y: hidden;
  overflow-x: hidden;
  
  animation: ${props => props.showZones ? 'zones-opening' : 'zones-closing'} 1s ease forwards;

  @keyframes zones-opening {
    0%   { height: 0;   }
    100% { height: ${props => props.zonesLength ? `${25 * props.zonesLength}px` : '175px'}; }
  }

  @keyframes zones-closing {
    0%   { height: ${props => props.zonesLength ? `${25 * props.zonesLength}px` : '175px'}; }
    100% { height: 0;   }
  }
`

const ListItem = styled.li`
  padding: 0px 5px 0px 0px;
  margin: 0;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  margin: 0;
  border-bottom: rgba(255, 255, 255, 0.2) 1px solid;
  line-height: 1.9em;
`

const Layers = styled(LayersSVG)`
  width: 30px;
`

const SearchIcon = styled(SearchIconSVG)`
  margin-bottom: -6px;
  margin-right: -2px;
  border-radius: 2px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  width: 20px;
  height: 20px;
  float: right;
  padding-right: 10px;
`

const Close = styled.img`
  width: 10px;
  float: right;
  padding-right: 15px;
  margin-top: 5px;
`

export default LeftSidebar
