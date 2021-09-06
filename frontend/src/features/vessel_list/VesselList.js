import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'rsuite/lib/Modal'

import { ReactComponent as VesselListSVG } from '../icons/Icone_liste_navires.svg'
import { COLORS } from '../../constants/constants'
import { getZonesAndSubZonesPromises, layersType } from '../../domain/entities/layers'
import { removeZoneSelected, resetZonesSelected, setInteraction, setZonesSelected } from '../../domain/shared_slices/Map'
import { InteractionTypes } from '../../domain/entities/map'
import VesselListTable from './VesselListTable'
import DownloadVesselListModal from './DownloadVesselListModal'
import getAdministrativeZoneGeometry from '../../domain/use_cases/getAdministrativeZoneGeometry'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import unselectVessel from '../../domain/use_cases/unselectVessel'
import getFilteredVessels from '../../domain/use_cases/getFilteredVessels'
import VesselListFilters from './VesselListFilters'
import { getVesselObjectFromFeature } from './dataFormatting'
import SaveVesselFiltersModal from '../vessel_filters/SaveVesselFiltersModal'
import { addFilter } from '../../domain/shared_slices/Filter'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'

const VesselList = ({ namespace }) => {
  const dispatch = useDispatch()
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const {
    vesselsLayerSource,
    selectedVessel,
    uniqueVesselsSpecies: species,
    uniqueVesselsDistricts: districts
  } = useSelector(state => state.vessel)
  const fleetSegments = useSelector(state => state.fleetSegment.fleetSegments)
  const gears = useSelector(state => state.gear.gears)
  const { healthcheckTextWarning } = useSelector(state => state.global)

  const firstUpdate = useRef(true)
  const [vesselListModalIsOpen, setVesselListModalIsOpen] = useState(false)
  const [downloadVesselListModalIsOpen, setDownloadVesselListModalIsOpen] = useState(false)
  const [saveVesselFilterModalIsOpen, setSaveVesselFilterModalIsOpen] = useState(false)
  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const [vessels, setVessels] = useState([])
  const [filteredVessels, setFilteredVessels] = useState([])
  const [vesselsCountTotal, setVesselsCountTotal] = useState(0)
  const [vesselsCountShowed, setVesselsCountShowed] = useState(0)
  const [allVesselsChecked, setAllVesselsChecked] = useState({ globalCheckbox: true })
  const [zoneGroups, setZoneGroups] = useState([])

  // Filters
  const [zonesFilter, setZonesFilter] = useState([])
  const [lastPositionTimeAgoFilter, setLastPositionTimeAgoFilter] = useState(3)
  const [lastControlMonthsAgo, setLastControlMonthsAgo] = useState(null)
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
    if (vesselListModalIsOpen === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false

      updateVesselsList()
    }
  }, [vesselListModalIsOpen])

  const updateVesselsList = () => {
    const vessels = []
    vesselsLayerSource.forEachFeature(feature => {
      const coordinates = [...feature.getGeometry().getCoordinates()]

      vessels.push(getVesselObjectFromFeature(feature, coordinates))
    })

    setVessels(vessels)
    setVesselsCountTotal(vessels.length)
  }

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
        vesselsSizeValuesChecked,
        lastControlMonthsAgo
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
    vesselsSizeValuesChecked,
    lastControlMonthsAgo
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
    setCountriesFiltered([])
    setAdministrativeZonesFiltered([])
    setLastPositionTimeAgoFilter(3)
    setFleetSegmentsFiltered([])
    setGearsFiltered([])
    setSpeciesFiltered([])
    setDistrictsFiltered([])
    setVesselsSizeValuesChecked([])

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
            dispatch(getAdministrativeZoneGeometry(zoneToFetch.groupCode, zoneToFetch.code, zoneToFetch.name, namespace))
          } else {
            dispatch(getAdministrativeZoneGeometry(zoneToFetch.code, null, zoneToFetch.name, namespace))
          }
        })

      setIsFiltering(false)
    }
  }, [administrativeZonesFiltered, namespace])

  useEffect(() => {
    if (zonesSelected && zonesSelected.length &&
      administrativeZonesFiltered &&
      zonesSelected.length > administrativeZonesFiltered.length) {
      const nextZonesSelected = zonesSelected.filter(zoneSelected => {
        if (zoneSelected.code === layersType.FREE_DRAW) {
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
      <Wrapper isFiltering={isFiltering}>
        <VesselListIcon
          healthcheckTextWarning={healthcheckTextWarning}
          isOpen={vesselListModalIsOpen}
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
              controls={{
                lastControlMonthsAgo,
                setLastControlMonthsAgo
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
            {/*
            TODO To check : is this feature still needed ?
            <ShowOnMapButton
              disabled={!(filteredVessels && filteredVessels.length)}
              onClick={() => highLightOnMap()}>
              Voir sur la carte
            </ShowOnMapButton> */}
            <BlackButton
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
      <DownloadVesselListModal
        isOpen={downloadVesselListModalIsOpen}
        setIsOpen={setDownloadVesselListModalIsOpen}
        filteredVessels={filteredVessels}
      />
      <SaveVesselFiltersModal
        isOpen={saveVesselFilterModalIsOpen}
        setIsOpen={setSaveVesselFilterModalIsOpen}
        closeAndResetVesselList={closeAndResetVesselList}
        filters={{
          countriesFiltered,
          fleetSegmentsFiltered,
          gearsFiltered,
          speciesFiltered,
          districtsFiltered,
          zonesSelected,
          vesselsSizeValuesChecked,
          lastControlMonthsAgo: lastControlMonthsAgo
        }}
        addFilter={addFilterCallback}
      />
    </>
  )
}

const Wrapper = styled(MapComponentStyle)`
  transition: all 0.2s;
  cursor: ${props => props.isFiltering ? 'progress' : 'auto'};
`

const BlackButton = styled.button`
  background: ${COLORS.charcoal};
  padding: 5px 12px;
  margin: 20px ${props => props.isLast ? '20px' : '0'} 20px 10px;
  font-size: 13px;
  color: ${COLORS.gainsboro};
  
  :hover, :focus {
    background: ${COLORS.charcoal};
  }
`

const Title = styled.div`
  font-size: 16px;
  color: ${COLORS.slateGray};
  font-weight: 500;
`

const VesselListIcon = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  padding: 8px 0px 0 1px;
  top: 68px;
  z-index: 99;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  transition: all 0.3s;
  
  :hover, :focus {
      background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
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
