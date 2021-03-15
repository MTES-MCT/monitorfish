import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {useDispatch, useSelector} from "react-redux";

import {ReactComponent as VesselListSVG} from '../components/icons/Icone_liste_navires.svg';
import {ReactComponent as BoxFilterSVG} from '../components/icons/Filtre_zone_rectangle.svg';
import {ReactComponent as PolygonFilterSVG} from '../components/icons/Filtre_zone_polygone.svg';
import {ReactComponent as CloseIconSVG} from '../components/icons/Croix_grise_clair.svg';
import {COLORS} from "../constants/constants";
import LayersEnum from "../domain/entities/layers";
import Modal from "rsuite/lib/Modal";
import TagPicker from "rsuite/lib/TagPicker";
import Tag from "rsuite/lib/Tag";
import SelectPicker from "rsuite/lib/SelectPicker";
import {resetZoneSelected, setInteraction} from "../domain/reducers/Map";
import {Interactions, OPENLAYERS_PROJECTION} from "../domain/entities/map";
import {resetTemporaryVesselsToHighLightOnMap, setTemporaryVesselsToHighLightOnMap} from "../domain/reducers/Vessel";
import VesselListTable from "../components/VesselListTable";
import DownloadVesselListModal from "../components/DownloadVesselListModal";
import countries from "i18n-iso-countries";
import {getCoordinates} from "../utils";

countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

const VesselList = () => {
    const dispatch = useDispatch()
    const layers = useSelector(state => state.layer.layers)
    const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

    const firstUpdate = useRef(true);
    const [vesselListModalIsOpen, setVesselListModalIsOpen] = useState(false)
    const [downloadVesselListModalIsOpen, setDownloadVesselListModalIsOpen] = useState(false)

    const [isShowed, setIsShowed] = useState(true)

    const [showBackToVesselListButton, setShowBackToVesselListButton] = useState(false)
    const [vessels, setVessels] = useState([])
    const [filteredVessels, setFilteredVessels] = useState([])
    const [vesselsCountTotal, setVesselsCountTotal] = useState(0)
    const [vesselsCountShowed, setVesselsCountShowed] = useState(0)
    const [allVesselsChecked, setAllVesselsChecked] = useState({ globalCheckbox: true })
    const [makeVesselListToNotUpdate, setMakeVesselListToNotUpdate] = useState(false)

    // Filters
    const [countriesFiltered, setCountriesFiltered] = useState([])
    const [lastPositionTimeAgoFilter, setLastPositionTimeAgoFilter] = useState(2)
    const zoneSelected = useSelector(state => state.map.zoneSelected)

    useEffect(() => {
        if (vesselListModalIsOpen === true) {
            firstUpdate.current = false
        }
    }, [vesselListModalIsOpen])

    useEffect(() => {
        if(layers && !makeVesselListToNotUpdate) {
            const vesselsLayer = layers.find(layer => layer.className_ === LayersEnum.VESSELS)
            const vesselsFeatures = vesselsLayer.getSource().getFeatures()

            if(vesselsFeatures && vesselsFeatures.length) {
                const vessels = vesselsFeatures.map(vessel => {
                    let coordinates = [...vessel.getGeometry().getCoordinates()]

                    return {
                        targetNumber: null,
                        id: vessel.id_,
                        checked: true,
                        vesselName: vessel.getProperties().vesselName,
                        course: vessel.getProperties().course,
                        speed: vessel.getProperties().speed,
                        flagState: vessel.getProperties().flagState.toLowerCase(),
                        mmsi: vessel.getProperties().mmsi,
                        internalReferenceNumber: vessel.getProperties().internalReferenceNumber,
                        externalReferenceNumber: vessel.getProperties().externalReferenceNumber,
                        ircs: vessel.getProperties().ircs,
                        dateTimeTimestamp: new Date(vessel.getProperties().dateTime).getTime(),
                        dateTime: vessel.getProperties().dateTime,
                        latitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION)[0],
                        longitude: getCoordinates(coordinates, OPENLAYERS_PROJECTION)[1],
                        olCoordinates: coordinates,
                        gears: vessel.getProperties().gears,
                    }
                })

                setVessels(vessels)
                setVesselsCountTotal(vessels.length)
                setMakeVesselListToNotUpdate(true)
            }
        }
    }, [layers])

    useEffect(() => {
        if(vessels && vessels.length) {
            let filteredVessels = vessels

            if(countriesFiltered && countriesFiltered.length) {
                filteredVessels = filteredVessels.filter(vessel => countriesFiltered.some(country => vessel.flagState === country))
            }

            if(lastPositionTimeAgoFilter) {
                filteredVessels = filteredVessels.filter(vessel => {
                    const vesselDate = new Date(vessel.dateTimeTimestamp)
                    const vesselIsHidden = new Date()
                    vesselIsHidden.setHours(vesselIsHidden.getHours() - lastPositionTimeAgoFilter)

                    return vesselDate > vesselIsHidden
                })
            }

            if(zoneSelected) {
                filteredVessels = filteredVessels.filter(vessel => {
                    return zoneSelected.getGeometry().intersectsCoordinate(vessel.olCoordinates)
                })

            }

            setFilteredVessels(filteredVessels)
            setVesselsCountShowed(filteredVessels.length)
        }
    }, [countriesFiltered, lastPositionTimeAgoFilter, zoneSelected, vessels])

    useEffect(() => {
        let nextVessels = vessels.map(vessel => {
            vessel.checked = allVesselsChecked.globalCheckbox

            return vessel
        })

        setVessels(nextVessels)
    }, [allVesselsChecked])

    const handleChange = (id, key, value) => {
        const nextVessels = Object.assign([], vessels)

        nextVessels.find(item => item.id === id)[key] = value
        setVessels(nextVessels)
    }

    const closeAndResetVesselList = () => {
        setVesselListModalIsOpen(false)
        setMakeVesselListToNotUpdate(false)
        setCountriesFiltered([])
        setLastPositionTimeAgoFilter(2)
        dispatch(resetZoneSelected(null))
    }

    const getCountries = () => {
        return Object.keys(countries.getAlpha2Codes()).map(country => {
            return {
                value: country.toLowerCase(),
                label: countries.getName(country, 'fr')
            }
        })
    }

    const selectBox = () => {
        setVesselListModalIsOpen(false)
        dispatch(setInteraction(Interactions.SQUARE))
    }

    const selectPolygon = () => {
        setVesselListModalIsOpen(false)
        dispatch(setInteraction(Interactions.POLYGON))
    }

    const highLightOnMap = () => {
        dispatch(setTemporaryVesselsToHighLightOnMap(filteredVessels))
        setVesselListModalIsOpen(false)
    }

    const goBackToVesselList = () => {
        dispatch(resetTemporaryVesselsToHighLightOnMap())
        setVesselListModalIsOpen(true)
    }

    const callResetZoneSelected = () => {
        dispatch(resetZoneSelected())
    }

    const download = () => {
        setDownloadVesselListModalIsOpen(true)
    }

    useEffect(() => {
        if(zoneSelected) {
            setVesselListModalIsOpen(true)
        }
    }, [zoneSelected])

    useEffect(() => {
        if(temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
            setShowBackToVesselListButton(true)
            setIsShowed(false)
        } else {
            setShowBackToVesselListButton(false)
            setIsShowed(true)
        }
    }, [temporaryVesselsToHighLightOnMap])

    const getLastPositionTimeAgo = () => {
        return [
            {
                label: '1 heure',
                value: 1
            },
            {
                label: '2 heures',
                value: 2
            },
            {
                label: '3 heures',
                value: 3
            },
            {
                label: '4 heures',
                value: 4
            },
            {
                label: '5 heures',
                value: 5
            },
            {
                label: '6 heures',
                value: 6
            },
            {
                label: '12 heures',
                value: 12
            },
            {
                label: '24 heures',
                value: 24
            }
        ]
    }

    return (
        <>
            <Wrapper isShowed={isShowed}>
                <VesselListIcon
                    title={"Liste des navires avec VMS"}
                    onClick={() => setVesselListModalIsOpen(true)}>
                    <Vessel/>
                </VesselListIcon>
                <Modal
                    full
                    backdrop={"static"}
                    show={vesselListModalIsOpen}
                    onHide={() => closeAndResetVesselList()}
                >
                    <Modal.Header>
                        <Modal.Title>
                            <Vessel isTitle={true}/> Liste des navires avec VMS
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Title>FILTRER LA LISTE</Title>
                        <Filters>
                            <FilterDesc>
                                Dernières positions depuis {' '}
                            </FilterDesc>
                            <TimeAgoSelect>
                                <SelectPicker
                                    style={{ width: 70 }}
                                    searchable={false}
                                    placeholder="x heures..."
                                    value={lastPositionTimeAgoFilter}
                                    onChange={setLastPositionTimeAgoFilter}
                                    data={getLastPositionTimeAgo()}
                                />
                            </TimeAgoSelect>
                            <TagPicker
                                value={countriesFiltered}
                                style={{ width: 170, margin: '7px 10px 0 20px', verticalAlign: 'sub' }}
                                data={getCountries()}
                                placeholder="Nationalité"
                                renderMenuItem={(name, item) => {
                                    return (
                                        <Label>
                                            {item.label}
                                        </Label>
                                    );
                                }}
                                onChange={change => setCountriesFiltered(change)}
                                renderValue={(values, items, tags) => {
                                    return items.map((tag, index) => (
                                        <Tag key={index}>
                                            {tag.label}
                                        </Tag>
                                    ));
                                }}
                            />
                            <ZoneFilter>
                                Définir une zone
                                <BoxFilter onClick={() => selectBox()}/>
                                <PolygonFilter onClick={() => selectPolygon()}/>
                                {
                                    zoneSelected ? <ZoneSelected>
                                        <LittleBox />
                                        Zone : tracé libre
                                        <CloseIcon onClick={() => callResetZoneSelected()}/>
                                    </ZoneSelected>: null
                                }
                            </ZoneFilter>
                        </Filters>
                        <VesselListTable
                            vessels={vessels}
                            filteredVessels={filteredVessels}
                            vesselsCountTotal={vesselsCountTotal}
                            vesselsCountShowed={vesselsCountShowed}
                            allVesselsChecked={allVesselsChecked}
                            setAllVesselsChecked={setAllVesselsChecked}
                            handleChange={handleChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <ShowOnMapButton
                            disabled={!(filteredVessels && filteredVessels.length)}
                            onClick={() => highLightOnMap()}>
                            Voir sur la carte
                        </ShowOnMapButton>
                        <DownloadButton
                            disabled={!(filteredVessels && filteredVessels.length)}
                            onClick={() => download()}>
                            Télécharger le tableau
                        </DownloadButton>
                    </Modal.Footer>
                </Modal>
            </Wrapper>
            <BackToVesselListButton
                showBackToVesselListButton={showBackToVesselListButton}
                onClick={() => goBackToVesselList()}
            >
                Revenir à la liste des navires
            </BackToVesselListButton>
            <DownloadVesselListModal
                isOpen={downloadVesselListModalIsOpen}
                setIsOpen={setDownloadVesselListModalIsOpen}
                filteredVessels={filteredVessels}
            />
        </>
    )
}

const ZoneSelected = styled.span`
  background: ${COLORS.grayBackground};
  border: 1px solid ${COLORS.grayDarker};
  border-radius: 12px;
  color: ${COLORS.textGray};
  margin-left: 10px;
  font-size: 13px;
  padding: 3px 3px 3px 3px;
  vertical-align: super;
`

const Wrapper = styled.div`
  animation: ${props => props.isShowed ? `vessel-search-box-opening` : `vessel-search-box-closing`} 0.2s ease forwards;

  @keyframes vessel-search-box-opening {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes vessel-search-box-closing {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
`

const BackToVesselListButton = styled.button`
  position: absolute;
  opacity: 0;
  top: 20px;
  left: auto;
  background: ${COLORS.grayDarkerThree};
  padding: 5px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  border-radius: 2px;
  margin-left: -90px;
  animation: ${props => props.showBackToVesselListButton ? `vessel-back-to-filter-button-opening` : `vessel-back-to-filter-button-closing`} 0.2s ease forwards;

  @keyframes vessel-back-to-filter-button-opening {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes vessel-back-to-filter-button-closing {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
`

const ShowOnMapButton = styled.button`
  border: 1px solid ${COLORS.grayDarkerThree};
  padding: 5px;
  margin: 20px 0 20px 0;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
  }
`

const DownloadButton = styled.button`
  background: ${COLORS.grayDarkerThree};
  padding: 5px;
  margin: 20px 20px 20px 10px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
`

const ZoneFilter = styled.div`
  display: inline-block;
  margin-right: 20px;
  margin-left: 50px;
  font-size: 13px;
  vertical-align: sub;
`

const TimeAgoSelect = styled.div`
  width: 120px;
  display: inline-block;
  margin-right: 20px;
  margin-left: 5px;
`

const Label = styled.span`
  font-size: 13px;
`

const FilterDesc = styled.span`
  font-size: 13px;
  margin-top: 7px;
  display: inline-block;
  vertical-align: sub;
`

const Filters = styled.div`
  color: #969696;
  font-size: 13px;
  margin-top: 15px;
  margin-bottom: 15px;
`

const Title = styled.div`
  font-size: 16px;
  color: #969696;
  font-weight: 500;
`

const VesselListIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.grayDarkerThree};
  padding: 8px 0px 0 1px;
  top: 60px;
  z-index: 99;
  right: 2px;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  margin-right: 8px;
  margin-top: 8px;

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const Vessel = styled(VesselListSVG)`
  width: 25px;
  height: 25px;
  ${props => props.isTitle ? 'vertical-align: text-bottom;' : null}
`

const BoxFilter = styled(BoxFilterSVG)`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 10px;
  vertical-align: text-bottom;
`

const LittleBox = styled(BoxFilterSVG)`
  width: 20px;
  height: 20px;
  margin-right: 5px;
  vertical-align: text-bottom;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  height: 13px;
  margin-left: 5px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-right: 3px;
  cursor: pointer;
`

const PolygonFilter = styled(PolygonFilterSVG)`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 10px;
  vertical-align: text-bottom;
`

export default VesselList
