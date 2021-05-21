import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'rsuite/lib/Modal'

import { ReactComponent as VesselListSVG } from '../components/icons/Icone_liste_navires.svg'
import { COLORS } from '../constants/constants'
import { getZonesAndSubZonesPromises } from '../domain/entities/layers'
import { removeZoneSelected, resetZonesSelected, setInteraction, setZonesSelected } from '../domain/reducers/Map'
import { InteractionTypes } from '../domain/entities/map'
import { resetTemporaryVesselsToHighLightOnMap, setTemporaryVesselsToHighLightOnMap } from '../domain/reducers/Vessel'
import VesselListTable from '../components/vessel_list/VesselListTable'
import DownloadVesselListModal from '../components/vessel_list/DownloadVesselListModal'
import getAdministrativeZoneGeometry from '../domain/use_cases/getAdministrativeZoneGeometry'
import { VESSELS_UPDATE_EVENT } from '../layers/VesselsLayer'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import VesselListFilters from '../components/vessel_list/VesselListFilters'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getUniqueSpeciesAndDistricts from '../domain/use_cases/getUniqueSpeciesAndDistricts'
import SaveVesselFiltersModal from '../components/vessel_filters/SaveVesselFiltersModal'
import { addFilter } from '../domain/reducers/Filter'

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
  const [saveVesselFilterModalIsOpen, setSaveVesselFilterModalIsOpen] = useState(false)
  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const [isShowed, setIsShowed] = useState(true)

  const [showBackToVesselListButton, setShowBackToVesselListButton] = useState(false)
  const [vessels, setVessels] = useState([])
  const [filteredVessels, setFilteredVessels] = useState([])
  const [vesselsCountTotal, setVesselsCountTotal] = useState(0)
  const [vesselsCountShowed, setVesselsCountShowed] = useState(0)
  const [allVesselsChecked, setAllVesselsChecked] = useState({ globalCheckbox: true })
  const [makeVesselListToNotUpdate, setMakeVesselListToNotUpdate] = useState(false)
  const [species, setSpecies] = useState([])
  const [districts, setDistricts] = useState([])
  const [zoneGroups, setZoneGroups] = useState([])

  // Filters
  const [zonesFilter, setZonesFilter] = useState([])
  const [lastPositionTimeAgoFilter, setLastPositionTimeAgoFilter] = useState(2)
  const [countriesFiltered, setCountriesFiltered] = useState([])
  const [administrativeZonesFiltered, setAdministrativeZonesFiltered] = useState([])
  const [fleetSegmentsFiltered, setFleetSegmentsFiltered] = useState([])
  const [gearsFiltered, setGearsFiltered] = useState([])
  const [speciesFiltered, setSpeciesFiltered] = useState([])
  const [districtsFiltered, setDistrictsFiltered] = useState([])
  const [vesselsSizeValuesChecked, setVesselsSizeValuesChecked] = useState([])
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
    dispatch(getUniqueSpeciesAndDistricts(vessels)).then(speciesAndDistricts => {
      setSpecies(speciesAndDistricts.species)
      setDistricts(speciesAndDistricts.districts)
    })
  }, [vessels])

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

      return getVesselObjectFromFeature(vessel, coordinates)
    })

    setVessels(vessels)
    setVesselsCountTotal(vessels.length)
    setMakeVesselListToNotUpdate(true)
  }, [])

  useEffect(() => {
    if (vessels && vessels.length) {
      const filters = {
        countriesFiltered,
        lastPositionTimeAgoFilter,
        zonesSelected,
        fleetSegmentsFiltered,
        gearsFiltered,
        districtsFiltered,
        speciesFiltered,
        vesselsSizeValuesChecked
      }

      dispatch(getFilteredVessels(vessels, filters))
        .then(filteredVessels => {
          setFilteredVessels(filteredVessels)
          setVesselsCountShowed(filteredVessels.length)
        })
    }
  }, [
    vessels,
    countriesFiltered,
    lastPositionTimeAgoFilter,
    zonesSelected,
    fleetSegmentsFiltered,
    gearsFiltered,
    districtsFiltered,
    speciesFiltered,
    vesselsSizeValuesChecked
  ])

  useEffect(() => {
    const nextVessels = vessels.map(vessel => {
      vessel.checked = allVesselsChecked.globalCheckbox

      return vessel
    })

    setVessels(nextVessels)
  }, [allVesselsChecked])

  const handleChangeModifiableKey = (id, key, value) => {
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

  const addFilterCallback = useCallback(filter => {
    dispatch(addFilter(filter))
  }, [])

  const selectBox = () => {
    setVesselListModalIsOpen(false)
    dispatch(setInteraction(InteractionTypes.SQUARE))
  }

  const selectPolygon = () => {
    setVesselListModalIsOpen(false)
    dispatch(setInteraction(InteractionTypes.POLYGON))
  }

  const highLightOnMap = () => {
    const vesselsToHighLight = filteredVessels.filter(vessel => vessel.checked)

    dispatch(setTemporaryVesselsToHighLightOnMap(vesselsToHighLight))
    setVesselListModalIsOpen(false)
  }

  const goBackToVesselList = () => {
    dispatch(resetTemporaryVesselsToHighLightOnMap())
    setVesselListModalIsOpen(true)
  }

  const callRemoveZoneSelected = zoneSelectedToRemove => {
    dispatch(removeZoneSelected(zoneSelectedToRemove.code))
  }

  const download = () => {
    setDownloadVesselListModalIsOpen(true)
  }

  const saveFilter = () => {
    setSaveVesselFilterModalIsOpen(true)
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
                gearsFiltered,
                setGearsFiltered
              }}
              species={{
                species,
                speciesFiltered,
                setSpeciesFiltered
              }}
              districts={{
                districts,
                districtsFiltered,
                setDistrictsFiltered
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
              seeMore={{
                seeMoreIsOpen,
                setSeeMoreIsOpen
              }}
              size={{
                vesselsSizeValuesChecked,
                setVesselsSizeValuesChecked
              }}
            />
            <VesselListTable
              vessels={vessels}
              filteredVessels={filteredVessels}
              vesselsCountTotal={vesselsCountTotal}
              vesselsCountShowed={vesselsCountShowed}
              allVesselsChecked={allVesselsChecked}
              setAllVesselsChecked={setAllVesselsChecked}
              handleChange={handleChangeModifiableKey}
              seeMoreIsOpen={seeMoreIsOpen}
              filters={{
                districtsFiltered,
                vesselsSizeValuesChecked
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <ShowOnMapButton
              disabled={!(filteredVessels && filteredVessels.length)}
              onClick={() => highLightOnMap()}>
              Voir sur la carte
            </ShowOnMapButton>
            <BlackButton
              disabled={!(filteredVessels && filteredVessels.length)}
              isLast={false}
              onClick={() => saveFilter()}>
              Enregistrer le filtre
            </BlackButton>
            <BlackButton
              disabled={!(filteredVessels && filteredVessels.length)}
              isLast={true}
              onClick={() => download()}>
              Télécharger le tableau
            </BlackButton>
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
      <SaveVesselFiltersModal
        isOpen={saveVesselFilterModalIsOpen}
        setIsOpen={setSaveVesselFilterModalIsOpen}
        filters={{
          countriesFiltered,
          fleetSegmentsFiltered,
          gearsFiltered,
          speciesFiltered,
          districtsFiltered,
          zonesSelected,
          vesselsSizeValuesChecked
        }}
        addFilter={addFilterCallback}
      />
    </>
  )
}

const Wrapper = styled.div`
  opacity: ${props => props.isShowed ? '1' : '0'};
  transition: all 0.2s;
  cursor: ${props => props.isFiltering ? 'progress' : 'auto'};
`

const BackToVesselListButton = styled.button`
  position: absolute;
  opacity: ${props => props.showBackToVesselListButton ? '1' : '0'};;
  top: 20px;
  left: auto;
  background: ${COLORS.grayDarkerThree};
  padding: 5px 12px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  border-radius: 2px;
  margin-left: -90px;
  transition: all 0.2s;
  
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

const BlackButton = styled.button`
  background: ${COLORS.grayDarkerThree};
  padding: 5px 12px;
  margin: 20px ${props => props.isLast ? '20px' : '0'} 20px 10px;
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
  margin-top: 8px;
  top: 60px;
  z-index: 99;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  transition: all 0.3s;
  
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
