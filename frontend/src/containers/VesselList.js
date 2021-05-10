import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'rsuite/lib/Modal'

import { ReactComponent as VesselListSVG } from '../components/icons/Icone_liste_navires.svg'
import { COLORS } from '../constants/constants'
import { getZonesAndSubZonesPromises } from '../domain/entities/layers'
import { removeZoneSelected, resetZonesSelected, setInteraction, setZonesSelected } from '../domain/reducers/Map'
import { InteractionTypes, OPENLAYERS_PROJECTION } from '../domain/entities/map'
import {
  resetTemporaryVesselsToHighLightOnMap,
  setTemporaryVesselsToHighLightOnMap
} from '../domain/reducers/Vessel'
import VesselListTable from '../components/vessel_list/VesselListTable'
import DownloadVesselListModal from '../components/vessel_list/DownloadVesselListModal'
import { getCoordinates } from '../utils'
import getAdministrativeZoneGeometry from '../domain/use_cases/getAdministrativeZoneGeometry'
import { VESSELS_UPDATE_EVENT } from '../layers/VesselsLayer'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import VesselListFilters from '../components/vessel_list/VesselListFilters'

const VesselList = () => {
  const dispatch = useDispatch()
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const vesselsLayerSource = useSelector(state => state.vessel.vesselsLayerSource)
  const vesselsFromApi = useSelector(state => state.vessel.vessels)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const fleetSegments = useSelector(state => state.fleetSegment.fleetSegments)
  const gears = useSelector(state => state.gear.gears)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const firstUpdate = useRef(true)
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
  const [zonesFilter, setZonesFilter] = useState([])

  // Filters
  const [lastPositionTimeAgoFilter, setLastPositionTimeAgoFilter] = useState(2)
  const [countriesFiltered, setCountriesFiltered] = useState([])
  const [administrativeZonesFiltered, setAdministrativeZonesFiltered] = useState([])
  const [zoneGroups, setZoneGroups] = useState([])
  const [fleetSegmentsFiltered, setFleetSegmentsFiltered] = useState([])
  const [gearsFiltered, setGearsFiltered] = useState([])
  const zonesSelected = useSelector(state => state.map.zonesSelected)
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    const nextZonesPromises = getZonesAndSubZonesPromises()

    Promise.all(nextZonesPromises).then((nextZones) => {
      let nextZonesWithoutNulls = nextZones.flat().filter(zone => zone)

      const groups = [...new Set(nextZonesWithoutNulls.map(zone => zone.group))]
      setZoneGroups(groups)

      nextZonesWithoutNulls = groups.map(group => {
        return {
          value: group,
          label: group,
          children: nextZonesWithoutNulls.filter(zone => zone.group === group)
        }
      })

      setZonesFilter(nextZonesWithoutNulls)
    })
  }, [])

  useEffect(() => {
    if (vesselListModalIsOpen === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false
    }
  }, [vesselListModalIsOpen])

  useEffect(() => {
    if (!makeVesselListToNotUpdate && vesselsLayerSource && vesselsFromApi && vesselsFromApi.length) {
      vesselsLayerSource.once(VESSELS_UPDATE_EVENT, ({ features }) => {
        if (features && features.length) {
          updateVesselsList(features)
        }
      })
    }
  }, [vesselsLayerSource, vesselsFromApi])

  const updateVesselsList = useCallback(features => {
    const vessels = features.map(vessel => {
      const coordinates = [...vessel.getGeometry().getCoordinates()]

      return {
        targetNumber: '',
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
        gears: vessel.getProperties().gearOnboard.map(gear => gear.gear).join(', '),
        gearsArray: vessel.getProperties().gearOnboard.map(gear => gear.gear),
        fleetSegments: vessel.getProperties().segments.join(', '),
        fleetSegmentsArray: vessel.getProperties().segments.map(segment => segment.replace(' ', ''))
      }
    })

    setVessels(vessels)
    setVesselsCountTotal(vessels.length)
    setMakeVesselListToNotUpdate(true)
  }, [])

  useEffect(() => {
    if (vessels && vessels.length) {
      dispatch(getFilteredVessels(vessels, countriesFiltered, lastPositionTimeAgoFilter, zonesSelected, fleetSegmentsFiltered, gearsFiltered)).then(filteredVessels => {
        setFilteredVessels(filteredVessels)
        setVesselsCountShowed(filteredVessels.length)
      })
    }
  }, [countriesFiltered, lastPositionTimeAgoFilter, zonesSelected, vessels, fleetSegmentsFiltered, gearsFiltered])

  useEffect(() => {
    const nextVessels = vessels.map(vessel => {
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
    setAdministrativeZonesFiltered([])
    setLastPositionTimeAgoFilter(2)
    dispatch(resetZonesSelected())
  }

  const selectBox = () => {
    setVesselListModalIsOpen(false)
    dispatch(setInteraction(InteractionTypes.SQUARE))
  }

  const selectPolygon = () => {
    setVesselListModalIsOpen(false)
    dispatch(setInteraction(InteractionTypes.POLYGON))
  }

  const highLightOnMap = () => {
    dispatch(setTemporaryVesselsToHighLightOnMap(filteredVessels.filter(vessel => vessel.checked)))
    setVesselListModalIsOpen(false)
  }

  const goBackToVesselList = () => {
    dispatch(resetTemporaryVesselsToHighLightOnMap())
    setVesselListModalIsOpen(true)
  }

  const callRemoveZoneSelected = zoneSelectedToRemove => {
    dispatch(removeZoneSelected(zoneSelectedToRemove.name))
  }

  const download = () => {
    setDownloadVesselListModalIsOpen(true)
  }

  useEffect(() => {
    if (zonesSelected && zonesSelected.length) {
      setVesselListModalIsOpen(true)
    }
  }, [zonesSelected])

  useEffect(() => {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
      setShowBackToVesselListButton(true)
      setIsShowed(false)
    } else {
      setShowBackToVesselListButton(false)
      setIsShowed(true)
    }
  }, [temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    if (administrativeZonesFiltered && zonesSelected &&
          administrativeZonesFiltered.length > zonesSelected.length) {
      setIsFiltering(true)

      const zonesGeometryToFetch = administrativeZonesFiltered
        .filter(zonesFiltered => !zonesSelected.some(alreadyFetchedZone => alreadyFetchedZone.code === zonesFiltered))
        .map(zoneName =>
          zonesFilter
            .map(group => group.children)
            .flat()
            .filter(zone => zone)
            .find(zone => zone.code === zoneName))

      zonesGeometryToFetch
        .forEach(zoneToFetch => {
          if (zoneToFetch.isSubZone) {
            dispatch(getAdministrativeZoneGeometry(zoneToFetch.groupCode, zoneToFetch.code, zoneToFetch.name))
          } else {
            dispatch(getAdministrativeZoneGeometry(zoneToFetch.code, null, zoneToFetch.name))
          }
        })

      setIsFiltering(false)
    }
  }, [administrativeZonesFiltered])

  useEffect(() => {
    if (zonesSelected && zonesSelected.length &&
            administrativeZonesFiltered &&
            zonesSelected.length > administrativeZonesFiltered.length) {
      const nextZonesSelected = zonesSelected.filter(zoneSelected => {
        if (zoneSelected.code === 'FREE_DRAW') {
          return true
        }

        return administrativeZonesFiltered
          .find(zoneFiltered => zoneFiltered === zoneSelected.code)
      })

      dispatch(setZonesSelected(nextZonesSelected))
    }
  }, [administrativeZonesFiltered])

  return (
        <>
            <Wrapper isShowed={isShowed} isFiltering={isFiltering}>
                <VesselListIcon
                    selectedVessel={selectedVessel}
                    onMouseEnter={() => dispatch(expandRightMenu())}
                    rightMenuIsOpen={rightMenuIsOpen}
                    title={'Liste des navires avec VMS'}
                    onClick={() => setVesselListModalIsOpen(true)}>
                    <Vessel
                      selectedVessel={selectedVessel}
                      rightMenuIsOpen={rightMenuIsOpen}
                    />
                </VesselListIcon>
                <Modal
                    full
                    backdrop={'static'}
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
                        <VesselListFilters
                          lastPositionTimeAgo={{
                            lastPositionTimeAgoFilter,
                            setLastPositionTimeAgoFilter
                          }}
                          countries={{
                            countriesFiltered,
                            setCountriesFiltered
                          }}
                          fleetSegments={{
                            fleetSegments,
                            fleetSegmentsFiltered,
                            setFleetSegmentsFiltered
                          }}
                          gears={{
                            gears,
                            setGearsFiltered,
                            gearsFiltered
                          }}
                          zones={{
                            zonesFilter,
                            zoneGroups,
                            administrativeZonesFiltered,
                            setAdministrativeZonesFiltered,
                            zonesSelected,
                            callRemoveZoneSelected
                          }}
                          geometrySelection={{
                            selectBox,
                            selectPolygon
                          }}
                        />
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
                firstUpdate={firstUpdate.current}
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

const Wrapper = styled.div`
  animation: ${props => props.isShowed ? 'vessel-search-box-opening' : 'vessel-search-box-closing'} 0.2s ease forwards;
  cursor: ${props => props.isFiltering ? 'progress' : 'auto'};

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
  padding: 5px 12px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  border-radius: 2px;
  margin-left: -90px;
  animation: ${props => props.firstUpdate ? '' : props.showBackToVesselListButton ? 'vessel-back-to-filter-button-opening' : 'vessel-back-to-filter-button-closing'} 0.2s ease forwards;

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
  padding: 5px 12px;
  margin: 20px 0;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
  }
`

const DownloadButton = styled.button`
  background: ${COLORS.grayDarkerThree};
  padding: 5px 12px;
  margin: 20px 20px 20px 10px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
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
  height: 40px;
  width: 40px;
  border-radius: 2px;
  right: 10px;
  margin-top: 8px;
  
  animation: ${props => props.selectedVessel && !props.rightMenuIsOpen ? 'vessel-list-icon-closing' : 'vessel-list-icon-opening'} 0.3s ease forwards;
  
  @keyframes vessel-list-icon-opening {
    0%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
     }
    100% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
  }

  @keyframes vessel-list-icon-closing {
    0% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
    100%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
    }
  }

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const Vessel = styled(VesselListSVG)`
  width: 25px;
  height: 25px;
  animation: ${props => !props.isTitle ? props.selectedVessel && !props.rightMenuIsOpen ? 'vessel-icon-hidden' : 'vessel-icon-visible' : null} 0.2s ease forwards;
  ${props => props.isTitle ? 'vertical-align: text-bottom;' : null}
  
  @keyframes vessel-icon-visible {
    0%   {
      opacity: 0;
     }
    100% {
      opacity: 1;
    }
  }

  @keyframes vessel-icon-hidden {
    0% {
      opacity: 1;
    }
    100%   {
      opacity: 0;
    }
  }
`

export default VesselList
