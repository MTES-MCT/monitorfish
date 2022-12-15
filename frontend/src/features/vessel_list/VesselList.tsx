import { useCallback, useEffect, useRef, useState } from 'react'
import { batch } from 'react-redux'
import { Modal } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { LayerType as LayersType, LayerType } from '../../domain/entities/layers/constants'
import { InteractionListener, InteractionType } from '../../domain/entities/map/constants'
import { VesselLocation } from '../../domain/entities/vessel/vessel'
import { setDisplayedComponents } from '../../domain/shared_slices/DisplayedComponent'
import { resetInteraction } from '../../domain/shared_slices/Draw'
import { addFilter } from '../../domain/shared_slices/Filter'
import { setBlockVesselsUpdate, setPreviewFilteredVesselsMode } from '../../domain/shared_slices/Global'
import { animateToExtent } from '../../domain/shared_slices/Map'
import { setProcessingRegulationSearchedZoneExtent } from '../../domain/shared_slices/Regulatory'
import { setPreviewFilteredVesselsFeatures } from '../../domain/shared_slices/Vessel'
import getAdministrativeZoneGeometry from '../../domain/use_cases/layer/administrative/getAdministrativeZoneGeometry'
import { getZonesAndSubZonesPromises } from '../../domain/use_cases/layer/administrative/getZonesAndSubZonesPromises'
import { addVesselListFilterZone } from '../../domain/use_cases/vessel/addVesselListFilterZone'
import { getFilteredVessels } from '../../domain/use_cases/vessel/getFilteredVessels'
import unselectVessel from '../../domain/use_cases/vessel/unselectVessel'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useListenForDrawedGeometry } from '../../hooks/useListenForDrawing'
import { theme } from '../../ui/theme'
import { getExtentFromGeoJSON } from '../../utils'
import { isNumeric } from '../../utils/isNumeric'
import StyledModalHeader from '../commonComponents/StyledModalHeader'
import { PrimaryButton, SecondaryButton } from '../commonStyles/Buttons.style'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { ReactComponent as VesselListSVG } from '../icons/Icone_liste_navires.svg'
import { ReactComponent as PreviewSVG } from '../icons/Oeil_apercu_carte.svg'
import { MapToolButton } from '../map/tools/MapToolButton'
import SaveVesselFiltersModal from '../map/tools/vessel_filters/SaveVesselFiltersModal'
import DownloadVesselListModal from './DownloadVesselListModal'
import { addZoneSelected, removeZoneSelected, resetZonesSelected, setZonesSelected } from './VesselList.slice'
import { VesselListFilters } from './VesselListFilters'
import { VesselListTable } from './VesselListTable'

import type { VesselEnhancedLastPositionWebGLObject } from '../../domain/entities/vessel/types'

const NOT_FOUND = -1

type CheckedVesselEnhancedLastPositionWebGLObject = VesselEnhancedLastPositionWebGLObject & {
  checked?: boolean
}

type ZoneChildren = {
  code: string
  group: string
  groupCode: string
  isSubZone: boolean
  label: string
  name: string
  value: string
}

type ZoneGroupAndChildren = {
  children: ZoneChildren[]
  label: string
  value: string
}

export function VesselList({ namespace }) {
  const dispatch = useAppDispatch()
  const { previewFilteredVesselsMode, rightMenuIsOpen } = useAppSelector(state => state.global)
  const { isVesselListModalDisplayed } = useAppSelector(state => state.displayedComponent)
  const { geometry } = useListenForDrawedGeometry(InteractionListener.VESSELS_LIST)
  const {
    uniqueVesselsDistricts: districts,
    uniqueVesselsSpecies: species,
    vessels
  } = useAppSelector(state => state.vessel)
  const fleetSegments = useAppSelector(state => state.fleetSegment.fleetSegments)
  const gears = useAppSelector(state => state.gear.gears)

  const firstUpdate = useRef(true)
  const [downloadVesselListModalIsOpen, setDownloadVesselListModalIsOpen] = useState(false)
  const [saveVesselFilterModalIsOpen, setSaveVesselFilterModalIsOpen] = useState(false)
  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const [_vessels, setVessels] = useState<CheckedVesselEnhancedLastPositionWebGLObject[]>([])
  const [filteredVessels, setFilteredVessels] = useState<CheckedVesselEnhancedLastPositionWebGLObject[]>([])
  const [vesselsCountTotal, setVesselsCountTotal] = useState(0)
  const [vesselsCountShowed, setVesselsCountShowed] = useState(0)
  const [allVesselsChecked, setAllVesselsChecked] = useState({ globalCheckbox: true })
  const [zoneGroups, setZoneGroups] = useState<string[]>([])

  // Filters
  const zonesSelected = useAppSelector(state => state.vesselList.zonesSelected)

  const [zonesFilter, setZonesFilter] = useState<ZoneGroupAndChildren[]>([])
  const [lastPositionTimeAgoFilter, setLastPositionTimeAgoFilter] = useState(3)
  const [lastControlMonthsAgo, setLastControlMonthsAgo] = useState(null)
  const [countriesFiltered, setCountriesFiltered] = useState([])
  const [administrativeZonesFiltered, setAdministrativeZonesFiltered] = useState<string[]>([])
  const [fleetSegmentsFiltered, setFleetSegmentsFiltered] = useState([])
  const [gearsFiltered, setGearsFiltered] = useState([])
  const [speciesFiltered, setSpeciesFiltered] = useState([])
  const [districtsFiltered, setDistrictsFiltered] = useState([])
  const [vesselsSizeValuesChecked, setVesselsSizeValuesChecked] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [vesselsLocationFilter, setVesselsLocationFilter] = useState([VesselLocation.SEA, VesselLocation.PORT])

  const hasNoFilter = () =>
    !lastControlMonthsAgo &&
    !zonesSelected?.length &&
    !countriesFiltered?.length &&
    !fleetSegmentsFiltered?.length &&
    !gearsFiltered?.length &&
    !speciesFiltered?.length &&
    !districtsFiltered?.length &&
    !vesselsSizeValuesChecked?.length &&
    vesselsLocationFilter?.length === 2

  useEffect(() => {
    if (!geometry) {
      return
    }

    dispatch(
      addZoneSelected({
        code: LayersType.FREE_DRAW,
        feature: geometry,
        name: 'Tracé libre'
      })
    )
    dispatch(
      setDisplayedComponents({
        isVesselListModalDisplayed: true
      })
    )
    dispatch(resetInteraction())
  }, [dispatch, geometry])

  useEffect(() => {
    const nextZonesPromises = dispatch(getZonesAndSubZonesPromises())

    Promise.all(nextZonesPromises).then(nextZones => {
      let nextZonesWithoutNulls = nextZones.flat().filter(zone => zone)

      const groups = [...new Set(nextZonesWithoutNulls.map(zone => zone.group))]
      setZoneGroups(groups)

      nextZonesWithoutNulls = groups.map(group => ({
        children: nextZonesWithoutNulls.filter(zone => zone.group === group),
        label: group,
        value: group
      }))

      setZonesFilter(nextZonesWithoutNulls)
    })
  }, [dispatch])

  useEffect(() => {
    if (isVesselListModalDisplayed === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false

      dispatch(setBlockVesselsUpdate(true))
      setVessels(vessels as CheckedVesselEnhancedLastPositionWebGLObject[])
      setVesselsCountTotal(vessels?.length || 0)
    }
  }, [dispatch, vessels, isVesselListModalDisplayed])

  useEffect(() => {
    if (_vessels?.length) {
      const filters = {
        countriesFiltered,
        districtsFiltered,
        fleetSegmentsFiltered,
        gearsFiltered,
        lastControlMonthsAgo,
        lastPositionTimeAgoFilter,
        speciesFiltered,
        vesselsLocationFilter,
        vesselsSizeValuesChecked,
        zonesSelected
      }
      setTimeout(() => {
        dispatch(getFilteredVessels(_vessels, filters)).then(_filteredVessels => {
          setFilteredVessels(_filteredVessels)
          setVesselsCountShowed(_filteredVessels.length)
        })
      }, 0)
    }
  }, [
    dispatch,
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
    const nextVessels = _vessels.map(vessel => ({
      ...vessel,
      checked: allVesselsChecked.globalCheckbox
    }))

    setVessels(nextVessels)
  }, [_vessels, allVesselsChecked])

  const toggleSelectRow = useCallback(
    (vesselFeatureId, value) => {
      const nextVessels: CheckedVesselEnhancedLastPositionWebGLObject[] = Object.assign([], _vessels)

      const toggledVesselIndex = nextVessels.findIndex(vessel => vessel.vesselFeatureId === vesselFeatureId)
      if (toggledVesselIndex === NOT_FOUND) {
        return
      }

      const vesselWithCheckedUpdated = nextVessels[toggledVesselIndex]
      if (!vesselWithCheckedUpdated) {
        return
      }
      nextVessels.splice(toggledVesselIndex, 1, { ...vesselWithCheckedUpdated, checked: value })
      setVessels(nextVessels)
    },
    [_vessels, setVessels]
  )

  const closeAndResetVesselList = useCallback(() => {
    setCountriesFiltered([])
    setAdministrativeZonesFiltered([])
    setLastPositionTimeAgoFilter(3)
    setFleetSegmentsFiltered([])
    setGearsFiltered([])
    setSpeciesFiltered([])
    setDistrictsFiltered([])
    setVesselsSizeValuesChecked([])
    setVesselsLocationFilter([VesselLocation.SEA, VesselLocation.PORT])

    dispatch(
      setDisplayedComponents({
        isVesselListModalDisplayed: false
      })
    )
    dispatch(setBlockVesselsUpdate(false))
    dispatch(resetZonesSelected())
  }, [dispatch])

  const addFilterCallback = useCallback(
    filter => {
      dispatch(addFilter(filter))
    },
    [dispatch]
  )

  const selectBox = useCallback(() => {
    batch(() => {
      dispatch(addVesselListFilterZone(InteractionType.SQUARE))
      dispatch(setBlockVesselsUpdate(true))
    })
  }, [dispatch])

  const selectPolygon = useCallback(() => {
    batch(() => {
      dispatch(addVesselListFilterZone(InteractionType.POLYGON))
      dispatch(setBlockVesselsUpdate(true))
    })
  }, [dispatch])

  const callRemoveZoneSelected = useCallback(
    zoneSelectedToRemove => {
      dispatch(removeZoneSelected(zoneSelectedToRemove.code))
    },
    [dispatch]
  )

  const download = useCallback(() => {
    setDownloadVesselListModalIsOpen(true)
  }, [])

  const saveFilter = useCallback(() => {
    setSaveVesselFilterModalIsOpen(true)
  }, [])

  const previewFilteredVessels = useCallback(() => {
    const vesselFeatureIds = filteredVessels.map(vessel => vessel.vesselFeatureId)

    if (vesselFeatureIds?.length) {
      dispatch(setPreviewFilteredVesselsFeatures(vesselFeatureIds))
      dispatch(setPreviewFilteredVesselsMode(true))

      if (zonesSelected?.length) {
        // TODO Finish that
        // @ts-ignore
        const extent = getExtentFromGeoJSON(zonesSelected[0]?.feature)
        if (extent?.length && !isNumeric(extent[0]) && !isNumeric(extent[1])) {
          batch(() => {
            dispatch(setProcessingRegulationSearchedZoneExtent(extent))
            dispatch(animateToExtent())
          })
        }
      }
    }
  }, [dispatch, filteredVessels, zonesSelected])

  useEffect(() => {
    if (previewFilteredVesselsMode) {
      dispatch(
        setDisplayedComponents({
          isVesselListModalDisplayed: false
        })
      )
      // TODO Investigate that. Should be a defined boolean.
    } else if (previewFilteredVesselsMode !== undefined) {
      dispatch(
        setDisplayedComponents({
          isVesselListModalDisplayed: true
        })
      )
    }
  }, [dispatch, previewFilteredVesselsMode])

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
            .find(zone => zone.code === zoneName)
        )

      zonesGeometryToFetch.forEach(zoneToFetch => {
        if (!zoneToFetch) {
          return
        }

        if (zoneToFetch.isSubZone) {
          dispatch(getAdministrativeZoneGeometry(zoneToFetch.groupCode, zoneToFetch.code, zoneToFetch.name, namespace))
        } else {
          dispatch(getAdministrativeZoneGeometry(zoneToFetch.code, null, zoneToFetch.name, namespace))
        }
      })

      setIsFiltering(false)
    }
  }, [dispatch, administrativeZonesFiltered, zonesFilter, namespace, zonesSelected])

  useEffect(() => {
    if (
      zonesSelected &&
      zonesSelected.length &&
      administrativeZonesFiltered &&
      zonesSelected.length > administrativeZonesFiltered.length
    ) {
      const nextZonesSelected = zonesSelected.filter(zoneSelected => {
        if (zoneSelected.code === LayerType.FREE_DRAW) {
          return true
        }

        return administrativeZonesFiltered.find(zoneFiltered => zoneFiltered === zoneSelected.code)
      })

      dispatch(setZonesSelected(nextZonesSelected))
    }
  }, [dispatch, zonesSelected, administrativeZonesFiltered])

  const isRightMenuShrinked = !rightMenuIsOpen

  return (
    <>
      <Wrapper healthcheckTextWarning={false} isFiltering={isFiltering}>
        <VesselListButton
          dataCy="vessel-list"
          isOpen={isVesselListModalDisplayed}
          onClick={() =>
            dispatch(
              setDisplayedComponents({
                isVesselListModalDisplayed: true
              })
            )
          }
          style={{ top: 68 }}
          title="Liste des navires avec VMS"
        >
          <VesselIcon
            $background={isVesselListModalDisplayed ? theme.color.blueGray[100] : COLORS.charcoal}
            $isRightMenuShrinked={isRightMenuShrinked}
            $isTitle={false}
          />
        </VesselListButton>
        <Modal
          backdrop="static"
          onClose={() => closeAndResetVesselList()}
          open={isVesselListModalDisplayed}
          size="full"
        >
          <StyledModalHeader isFull>
            <Modal.Title>
              <VesselIcon $background={COLORS.charcoal} $isRightMenuShrinked={undefined} $isTitle /> Liste des navires
              avec VMS
            </Modal.Title>
          </StyledModalHeader>
          <Modal.Body>
            <Title>FILTRER LA LISTE</Title>
            <VesselListFilters
              controls={{
                lastControlMonthsAgo,
                setLastControlMonthsAgo
              }}
              countries={{
                countriesFiltered,
                setCountriesFiltered
              }}
              districts={{
                districts,
                districtsFiltered,
                setDistrictsFiltered
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
              geometrySelection={{
                selectBox,
                selectPolygon
              }}
              lastPositionTimeAgo={{
                lastPositionTimeAgoFilter,
                setLastPositionTimeAgoFilter
              }}
              location={{
                setVesselsLocationFilter,
                vesselsLocationFilter
              }}
              seeMore={{
                seeMoreIsOpen,
                setSeeMoreIsOpen
              }}
              size={{
                setVesselsSizeValuesChecked,
                vesselsSizeValuesChecked
              }}
              species={{
                setSpeciesFiltered,
                species,
                speciesFiltered
              }}
              zones={{
                administrativeZonesFiltered,
                callRemoveZoneSelected,
                setAdministrativeZonesFiltered,
                zoneGroups,
                zonesFilter,
                zonesSelected
              }}
            />
            <VesselListTable
              allVesselsChecked={allVesselsChecked}
              filteredVessels={filteredVessels}
              filters={{
                districtsFiltered,
                vesselsSizeValuesChecked
              }}
              seeMoreIsOpen={seeMoreIsOpen}
              setAllVesselsChecked={setAllVesselsChecked}
              toggleSelectRow={toggleSelectRow}
              vessels={_vessels}
              vesselsCountShowed={vesselsCountShowed}
              vesselsCountTotal={vesselsCountTotal}
            />
          </Modal.Body>
          <Modal.Footer>
            <PreviewButton
              data-cy="preview-filtered-vessels"
              disabled={!(filteredVessels && filteredVessels.length)}
              onClick={previewFilteredVessels}
            >
              <Preview />
              Aperçu sur la carte
            </PreviewButton>
            <BlackButton
              data-cy="save-filter-modal"
              disabled={hasNoFilter()}
              isLast={false}
              onClick={() => saveFilter()}
            >
              Enregistrer le filtre
            </BlackButton>
            <BlackButton
              data-cy="download-vessels-modal"
              disabled={!filteredVessels?.some(vessel => vessel.checked)}
              isLast
              onClick={() => download()}
            >
              Télécharger le tableau
            </BlackButton>
          </Modal.Footer>
        </Modal>
      </Wrapper>
      <DownloadVesselListModal
        filteredVessels={filteredVessels}
        isOpen={downloadVesselListModalIsOpen}
        setIsOpen={setDownloadVesselListModalIsOpen}
      />
      <SaveVesselFiltersModal
        addFilter={addFilterCallback}
        closeAndResetVesselList={closeAndResetVesselList}
        filters={{
          countriesFiltered,
          districtsFiltered,
          fleetSegmentsFiltered,
          gearsFiltered,
          lastControlMonthsAgo,
          speciesFiltered,
          vesselsSizeValuesChecked,
          zonesSelected
        }}
        isOpen={saveVesselFilterModalIsOpen}
        setIsOpen={setSaveVesselFilterModalIsOpen}
      />
    </>
  )
}

const Wrapper = styled(MapComponentStyle)<{
  isFiltering: boolean
}>`
  transition: all 0.2s;
  cursor: ${p => (p.isFiltering ? 'progress' : 'auto')};
`

const PreviewButton = styled(SecondaryButton)`
  float: left;
  margin-left: 25px;
  padding-left: 5px;
`

const BlackButton = styled(PrimaryButton)<{
  isLast: boolean
}>`
  margin: 20px ${p => (p.isLast ? '20px' : '0')} 20px 10px;
  font-size: 13px;
  color: ${COLORS.gainsboro};
`

const Title = styled.div`
  font-size: 16px;
  color: ${COLORS.slateGray};
  font-weight: 500;
`

const VesselListButton = styled(MapToolButton)``

const VesselIcon = styled(VesselListSVG)<{
  $background: string
  $isRightMenuShrinked: boolean | undefined
  $isTitle: boolean
}>`
  width: 25px;
  height: 25px;
  margin-top: 4px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  vertical-align: ${p => (p.$isTitle ? 'text-bottom' : 'baseline')};
  circle {
    fill: ${p => p.$background};
  }
  transition: all 0.3s;
`

const Preview = styled(PreviewSVG)`
  width: 23px;
  margin-right: 8px;
  vertical-align: text-top;
`
