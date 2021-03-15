import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';

import RegulatoryZoneSelectionSearchInput from "./RegulatoryZoneSelectionSearchInput";
import {ReactComponent as SearchIconSVG} from '../icons/Loupe.svg'
import RegulatoryZoneSelectionList from "./RegulatoryZoneSelectionList";
import {COLORS} from "../../constants/constants";

function useOutsideAlerter(ref, showRegulatorySearchInput, setShowRegulatorySection) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target) && showRegulatorySearchInput) {
                setShowRegulatorySection(false)
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, showRegulatorySearchInput]);
}

const RegulatoryZoneSelection = props => {
    const [showRegulatorySection, setShowRegulatorySection] = useState(false);
    const [foundRegulatoryZones, setFoundRegulatoryZones] = useState({});
    const [regulatoryZonesSelection, setRegulatoryZonesSelection] = useState({})
    const [initSearchFields, setInitSearchFields] = useState(false)

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, showRegulatorySection, setShowRegulatorySection);

    useEffect(() => {
        if(showRegulatorySection && props.regulatoryZoneMetadataPanelIsOpen) {
            setShowRegulatorySection(false)
        }
    }, [props.regulatoryZoneMetadataPanelIsOpen])

    useEffect(() => {
        if(showRegulatorySection && props.regulatoryZoneMetadataPanelIsOpen) {
            props.callCloseRegulatoryZoneMetadata()
        }
    }, [showRegulatorySection])

    const resetSelectRegulatoryZone = () => {
        setRegulatoryZonesSelection({})
    }

    useEffect(() => {
        if(foundRegulatoryZones && Object.keys(foundRegulatoryZones).length > 0) {
            props.setHideZonesListWhenSearching({})
        }
    }, [foundRegulatoryZones, showRegulatorySection])

    const toggleSelectRegulatoryZone = (regulatoryZoneName, regulatorySubZones) => {
        let existingSelectedZones = {...regulatoryZonesSelection}

        if(!regulatoryZonesSelection[regulatoryZoneName] || !regulatoryZonesSelection[regulatoryZoneName].length) {
            existingSelectedZones[regulatoryZoneName] = regulatorySubZones
            setRegulatoryZonesSelection(existingSelectedZones)
        } else {
            regulatorySubZones.forEach(regulatorySubZone => {
                if(existingSelectedZones[regulatoryZoneName].some(item =>
                    item.layerName === regulatorySubZone.layerName &&
                    item.zone === regulatorySubZone.zone)) {
                    existingSelectedZones[regulatoryZoneName] = existingSelectedZones[regulatoryZoneName].filter(item =>
                        !(item.layerName === regulatorySubZone.layerName &&
                        item.zone === regulatorySubZone.zone))
                    if(!existingSelectedZones[regulatoryZoneName].length) {
                        delete existingSelectedZones[regulatoryZoneName]
                    }
                } else {
                    existingSelectedZones[regulatoryZoneName] = existingSelectedZones[regulatoryZoneName].concat(regulatorySubZone)
                }
                setRegulatoryZonesSelection(existingSelectedZones)
            })
        }
    }

    function addRegulatoryZonesToMySelection(regulatoryZonesSelection) {
        const numberOfZonesAdded = Object.keys(regulatoryZonesSelection)
            .map(regulatoryLayerKey => regulatoryZonesSelection[regulatoryLayerKey].length)
            .reduce((a, b) => a + b, 0)
        props.setRegulatoryZonesAddedToMySelection(numberOfZonesAdded)
        setTimeout(() => { props.setRegulatoryZonesAddedToMySelection(0) }, 2000);
        props.callAddRegulatoryZonesToMySelection(regulatoryZonesSelection)
        setRegulatoryZonesSelection({})
    }

    return (<Search ref={wrapperRef}>
            {
                showRegulatorySection ? null
                : <RegulatoryZoneTitle
                        onClick={() => setShowRegulatorySection(!showRegulatorySection)}
                        showRegulatorySection={showRegulatorySection}
                    >
                        <TitleText>
                            Rechercher des zones réglementaires
                        </TitleText>
                        <SearchIcon />
                    </RegulatoryZoneTitle>
            }
        <RegulatoryZoneSelectionSearchInput
            showRegulatorySearchInput={showRegulatorySection}
            setShowRegulatorySection={setShowRegulatorySection}
            regulatoryZones={props.regulatoryZones}
            setFoundRegulatoryZones={setFoundRegulatoryZones}
            foundRegulatoryZones={foundRegulatoryZones}
            gears={props.gears}
            initSearchFields={initSearchFields}
            setInitSearchFields={setInitSearchFields}
            layersSidebarIsOpen={props.layersSidebarIsOpen}
            resetSelectRegulatoryZone={resetSelectRegulatoryZone}
        />
        <RegulatoryZoneSelectionList
            showRegulatorySearchInput={showRegulatorySection}
            foundRegulatoryZones={foundRegulatoryZones}
            gears={props.gears}
            showRegulatorySection={showRegulatorySection}
            regulatoryZonesSelection={regulatoryZonesSelection}
            toggleSelectRegulatoryZone={toggleSelectRegulatoryZone}
        />
        <RegulatoryZoneAddButton
            onClick={() => addRegulatoryZonesToMySelection(regulatoryZonesSelection)}
            showRegulatorySearchInput={showRegulatorySection}
            foundRegulatoryZones={foundRegulatoryZones}
        >
            {
                props.regulatoryZonesAddedToMySelection ? `${props.regulatoryZonesAddedToMySelection} zones ajoutées` : `Ajouter à mes zones`
            }
        </RegulatoryZoneAddButton>
    </Search>
    )
}

const Search = styled.div`
  width: 355px;
`

const TitleText = styled.span`
  margin-top: 10px;
  font-size: 13px;
  display: inline-block;
  font-weight: 400;
`

const RegulatoryZoneAddButton = styled.div`
  cursor: pointer;
  border-radius: 0;
  font-size: 0.8em;
  background: ${COLORS.grayDarkerThree};
  color: ${COLORS.gray};
  padding: 0;
  line-height: 2.5em;
  margin: 0;
  height: 0;
  width: 100%;
  overflow: hidden;
  user-select: none;
  animation: ${props => props.showRegulatorySearchInput && props.foundRegulatoryZones ? Object.keys(props.foundRegulatoryZones).length > 0 ? 'regulatory-button-opening' : 'regulatory-button-closing' : 'regulatory-button-closing'} 0.5s ease forwards;

  @keyframes regulatory-button-opening {
    0%   { height: 0;   }
    100% { height: 36px; }
  }

  @keyframes regulatory-button-closing {
    0%   { height: 36px; }
    100% { height: 0;   }
  }
`

const RegulatoryZoneTitle = styled.div`
  height: 40px;
  background: white;
  color: ${COLORS.grayDarkerTwo};
  font-size: 0.8em;
  cursor: pointer;
  font-weight: 300;
  text-align: left;
  padding-left: 10px;
  user-select: none;
  width: 345px;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
`

const SearchIcon = styled(SearchIconSVG)`
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.grayDarkerThree};  
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
`

export default RegulatoryZoneSelection
