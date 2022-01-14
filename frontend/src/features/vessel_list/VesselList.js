import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { batch, useDispatch, useSelector } from 'react-redux'
import Modal from 'rsuite/lib/Modal'

import { COLORS } from '../../constants/constants'
import { layersType } from '../../domain/entities/layers'
import {
  animateToExtent,
  setInteraction
} from '../../domain/shared_slices/Map'
import {
  removeZoneSelected,
  resetZonesSelected,
  setZonesSelected
} from './VesselList.slice'
import { InteractionTypes } from '../../domain/entities/map'
import VesselListTable from './VesselListTable'
import DownloadVesselListModal from './DownloadVesselListModal'
import getAdministrativeZoneGeometry from '../../domain/use_cases/getAdministrativeZoneGeometry'
import {
  expandRightMenu,
  openVesselListModal,
  closeVesselListModal,
  setBlockVesselsUpdate,
  setPreviewFilteredVesselsMode
} from '../../domain/shared_slices/Global'
import unselectVessel from '../../domain/use_cases/unselectVessel'
import getFilteredVessels from '../../domain/use_cases/getFilteredVessels'
import VesselListFilters from './VesselListFilters'
import { getVesselObjectFromFeature } from './dataFormatting'
import SaveVesselFiltersModal from '../vessel_filters/SaveVesselFiltersModal'
import { addFilter } from '../../domain/shared_slices/Filter'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { VesselListSVG } from '../commonStyles/icons/VesselListSVG'
import { getZonesAndSubZonesPromises } from '../../domain/use_cases/getZonesAndSubZonesPromises'
import { setPreviewFilteredVesselsFeatures } from '../../domain/shared_slices/Vessel'
import { PrimaryButton, SecondaryButton } from '../commonStyles/Buttons.style'
import { ReactComponent as PreviewSVG } from '../icons/Oeil_apercu_carte.svg'
import { VesselLocation } from '../../domain/entities/vessel'
import { setRegulationSearchedZoneExtent } from '../../domain/shared_slices/Regulatory'
import { getExtentFromGeoJSON } from '../../utils'

const VesselList = ({ namespace }) => {
  const dispatch = useDispatch()
  const {
    rightMenuIsOpen,
    vesselListModalIsOpen,
    healthcheckTextWarning,
    previewFilteredVesselsMode
  } = useSelector(state => state.global)
  const {
    vessels,
    selectedVessel,
    uniqueVesselsSpecies: species,
    uniqueVesselsDistricts: districts
  } = useSelector(state => state.vessel)
  const {
    coordinatesFormat
  } = useSelector(state => state.map)
  const fleetSegments = useSelector(state => state.fleetSegment.fleetSegments)
  const gears = useSelector(state => state.gear.gears)

  const firstUpdate = useRef(true)
  const [downloadVesselListModalIsOpen, setDownloadVesselListModalIsOpen] = useState(false)
  const [saveVesselFilterModalIsOpen, setSaveVesselFilterModalIsOpen] = useState(false)
  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const [_vessels, setVessels] = useState([])
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
  const zonesSelected = useSelector(state => state.vesselList.zonesSelected)
  const [isFiltering, setIsFiltering] = useState(false)
  const [vesselsLocationFilter, setVesselsLocationFilter] = useState([VesselLocation.SEA, VesselLocation.PORT])

  const hasNoFilter = () => !lastControlMonthsAgo &&
    !zonesSelected?.length &&
    !countriesFiltered?.length &&
    !fleetSegmentsFiltered?.length &&
    !gearsFiltered?.length &&
    !speciesFiltered?.length &&
    !districtsFiltered?.length &&
    !vesselsSizeValuesChecked?.length &&
    vesselsLocationFilter?.length === 2

  useEffect(() => {
    const nextZonesPromises = dispatch(getZonesAndSubZonesPromises())

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

      dispatch(setBlockVesselsUpdate(true))
      const currentvessels = vessels.map((vessel) => getVesselObjectFromFeature(vessel, coordinatesFormat))
      setVessels(currentvessels)
      setVesselsCountTotal(currentvessels?.length ? currentvessels?.length : 0)
    }
  }, [vesselListModalIsOpen])

  useEffect(() => {
    if (_vessels?.length) {
      const filters = {
        countriesFiltered,
        lastPositionTimeAgoFilter,
        zonesSelected,
        fleetSegmentsFiltered,
        gearsFiltered,
        districtsFiltered,
        speciesFiltered,
        vesselsSizeValuesChecked,
        lastControlMonthsAgo,
        vesselsLocationFilter
      }
      dispatch(getFilteredVessels(_vessels, filters))
        .then(_filteredVessels => {
          setFilteredVessels(_filteredVessels)
          setVesselsCountShowed(_filteredVessels.length)
        })
    }
  }, [
    _vessels,
    countriesFiltered,
    lastPositionTimeAgoFilter,
    zonesSelected,
    fleetSegmentsFiltered,
    gearsFiltered,
    districtsFiltered,
    speciesFiltered,
    vesselsSizeValuesChecked,
    lastControlMonthsAgo,
    vesselsLocationFilter
  ])

  useEffect(() => {
    const nextVessels = _vessels.map(vessel => {
      return {
        ...vessel,
        checked: allVesselsChecked.globalCheckbox
      }
    })

    setVessels(nextVessels)
  }, [allVesselsChecked])

  const handleChangeModifiableKey = (id, key, value) => {
    const nextVessels = Object.assign([], _vessels)

    nextVessels.find(item => item.id === id)[key] = value
    setVessels(nextVessels)
  }

  const closeAndResetVesselList = () => {
    setCountriesFiltered([])
    setAdministrativeZonesFiltered([])
    setLastPositionTimeAgoFilter(3)
    setFleetSegmentsFiltered([])
    setGearsFiltered([])
    setSpeciesFiltered([])
    setDistrictsFiltered([])
    setVesselsSizeValuesChecked([])
    setVesselsLocationFilter([VesselLocation.SEA, VesselLocation.PORT])

    batch(() => {
      dispatch(closeVesselListModal())
      dispatch(setBlockVesselsUpdate(false))
      dispatch(resetZonesSelected())
    })
  }

  const addFilterCallback = useCallback(filter => {
    dispatch(addFilter(filter))
  }, [])

  const selectBox = () => {
    batch(() => {
      dispatch(closeVesselListModal())
      dispatch(setInteraction({
        type: InteractionTypes.SQUARE,
        listener: layersType.VESSEL
      }))
      dispatch(setBlockVesselsUpdate(true))
    })
  }

  const selectPolygon = () => {
    batch(() => {
      dispatch(closeVesselListModal())
      dispatch(setInteraction({
        type: InteractionTypes.POLYGON,
        listener: layersType.VESSEL
      }))
      dispatch(setBlockVesselsUpdate(true))
    })
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

  const previewFilteredVessels = () => {
    const vesselsUids = filteredVessels.map(vessel => vessel.uid)

    if (vesselsUids?.length) {
      dispatch(setPreviewFilteredVesselsFeatures(vesselsUids))
      dispatch(setPreviewFilteredVesselsMode(true))

      if (zonesSelected?.length) {
        const extent = getExtentFromGeoJSON(zonesSelected[0]?.feature)
        if (extent?.length && !Number.isNaN(extent[0]) && !Number.isNaN(extent[1])) {
          batch(() => {
            dispatch(setRegulationSearchedZoneExtent(extent))
            dispatch(animateToExtent())
          })
        }
      }
    }
  }

  useEffect(() => {
    if (previewFilteredVesselsMode) {
      dispatch(closeVesselListModal())
    } else if (previewFilteredVesselsMode !== undefined) {
      dispatch(openVesselListModal())
    }
  }, [previewFilteredVesselsMode])

  useEffect(() => {
    if (zonesSelected?.length) {
      dispatch(openVesselListModal())
    }
  }, [zonesSelected])

  useEffect(() => {
    if (administrativeZonesFiltered?.length > zonesSelected?.length) {
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
          data-cy={'vessel-list'}
          isHidden={previewFilteredVesselsMode}
          healthcheckTextWarning={healthcheckTextWarning}
          isOpen={vesselListModalIsOpen}
          selectedVessel={selectedVessel}
          onMouseEnter={() => dispatch(expandRightMenu())}
          rightMenuIsOpen={rightMenuIsOpen}
          title={'Liste des navires avec VMS'}
          onClick={() => dispatch(openVesselListModal())}>
          <Vessel
            background={vesselListModalIsOpen ? COLORS.shadowBlue : COLORS.charcoal}
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
              <Vessel
                isTitle={true}
                background={COLORS.charcoal}
              /> Liste des navires avec VMS
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
              location={{
                vesselsLocationFilter,
                setVesselsLocationFilter
              }}
            />
            <VesselListTable
              vessels={_vessels}
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
            <PreviewButton
              data-cy={'preview-filtered-vessels'}
              hasIcon
              toLeft
              disabled={!(filteredVessels && filteredVessels.length)}
              isLast={false}
              onClick={() => previewFilteredVessels()}>
              <Preview/>
              Aperçu sur la carte
            </PreviewButton>
            <BlackButton
              data-cy={'save-filter-modal'}
              disabled={hasNoFilter()}
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

const PreviewButton = styled(SecondaryButton)`
  float: left;
  margin-left: 25px;
  padding-left: 5px;
`

const BlackButton = styled(PrimaryButton)`
  margin: 20px ${props => props.isLast ? '20px' : '0'} 20px 10px;
  font-size: 13px;
  color: ${COLORS.gainsboro};
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

const Preview = styled(PreviewSVG)`
  width: 23px;
  margin-right: 8px;
  vertical-align: text-top;
`

export default VesselList
