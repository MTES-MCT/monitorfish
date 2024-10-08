import getAdministrativeZoneGeometry from '@features/AdministrativeZone/useCases/getAdministrativeZoneGeometry'
import { StyledModalHeader } from '@features/commonComponents/StyledModalHeader'
import { PrimaryButton, SecondaryButton } from '@features/commonStyles/Buttons.style'
import { resetInteraction } from '@features/Draw/slice'
import { SaveVesselFiltersModal } from '@features/Filter/components/SaveVesselFiltersModal'
import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { DownloadVesselListModal } from '@features/Vessel/components/VesselList/DownloadVesselListModal'
import { VesselIcon } from '@features/Vessel/components/VesselList/index'
import { addZoneSelected, removeZoneSelected, setZonesSelected } from '@features/Vessel/components/VesselList/slice'
import { VesselListFilters } from '@features/Vessel/components/VesselList/VesselListFilters'
import { VesselListTable } from '@features/Vessel/components/VesselList/VesselListTable'
import { vesselSelectors } from '@features/Vessel/slice'
import { previewVessels } from '@features/Vessel/useCases/previewVessels'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from 'rsuite'
import styled from 'styled-components'

import { LayerType } from '../../../../domain/entities/layers/constants'
import { InteractionListener, InteractionType } from '../../../../domain/entities/map/constants'
import { VesselLocation } from '../../../../domain/entities/vessel/vessel'
import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'
import { setBlockVesselsUpdate } from '../../../../domain/shared_slices/Global'
import { addVesselListFilterZone } from '../../../../domain/use_cases/vessel/addVesselListFilterZone'
import { getFilteredVessels } from '../../../../domain/use_cases/vessel/getFilteredVessels'
import { unselectVessel } from '../../../../domain/use_cases/vessel/unselectVessel'
import { LegacyRsuiteComponentsWrapper } from '../../../../ui/LegacyRsuiteComponentsWrapper'
import PreviewSVG from '../../../icons/Oeil_apercu_carte.svg?react'

import type { VesselEnhancedLastPositionWebGLObject } from '../../../../domain/entities/vessel/types'

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

export function VesselListModal({ namespace, onClose }) {
  const dispatch = useMainAppDispatch()
  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.VESSELS_LIST)
  const { uniqueVesselsDistricts: districts, uniqueVesselsSpecies: species } = useMainAppSelector(state => state.vessel)
  const vessels = useMainAppSelector(vesselSelectors.selectAll)
  const getFleetSegmentsQuery = useGetFleetSegmentsQuery()
  const gears = useMainAppSelector(state => state.gear.gears)

  const firstUpdate = useRef(true)

  useEffect(() => {
    dispatch(unselectVessel())
    firstUpdate.current = false

    dispatch(setBlockVesselsUpdate(true))
    setVessels(vessels as CheckedVesselEnhancedLastPositionWebGLObject[])
    setVesselsCountTotal(vessels?.length || 0)

    return () => {}
  }, [dispatch, vessels])

  const [downloadVesselListModalIsOpen, setDownloadVesselListModalIsOpen] = useState(false)
  const [saveVesselFilterModalIsOpen, setSaveVesselFilterModalIsOpen] = useState(false)
  const [seeMoreIsOpen, setSeeMoreIsOpen] = useState(false)

  const [_vessels, setVessels] = useState<CheckedVesselEnhancedLastPositionWebGLObject[]>([])
  const [filteredVessels, setFilteredVessels] = useState<CheckedVesselEnhancedLastPositionWebGLObject[]>([])
  const [vesselsCountTotal, setVesselsCountTotal] = useState(0)
  const [vesselsCountShowed, setVesselsCountShowed] = useState(0)
  const [allVesselsChecked, setAllVesselsChecked] = useState(true)

  // Filters
  const zonesSelected = useMainAppSelector(state => state.vesselList.zonesSelected)
  const administrativeZonesFiltered = useMemo(
    () =>
      zonesSelected
        .filter(zoneSelected => zoneSelected.code !== LayerType.FREE_DRAW)
        .map(zoneSelected => zoneSelected.code),
    [zonesSelected]
  )

  const [zonesFilter, setZonesFilter] = useState<ZoneGroupAndChildren[]>([])
  const setZonesFilterCallback = useCallback(filter => {
    setZonesFilter(filter)
  }, [])

  const [lastPositionTimeAgoFilter, setLastPositionTimeAgoFilter] = useState(3)
  const [lastControlMonthsAgo, setLastControlMonthsAgo] = useState(null)
  const [countriesFiltered, setCountriesFiltered] = useState([])
  const [fleetSegmentsFiltered, setFleetSegmentsFiltered] = useState([])
  const [gearsFiltered, setGearsFiltered] = useState([])
  const [speciesFiltered, setSpeciesFiltered] = useState([])
  const [districtsFiltered, setDistrictsFiltered] = useState([])
  const [vesselsSizeValuesChecked, setVesselsSizeValuesChecked] = useState([])
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
    if (!drawedGeometry) {
      return
    }

    dispatch(
      addZoneSelected({
        code: LayerType.FREE_DRAW,
        feature: drawedGeometry,
        name: 'Tracé libre'
      })
    )
    dispatch(
      setDisplayedComponents({
        isVesselListModalDisplayed: true
      })
    )
    dispatch(resetInteraction())
  }, [dispatch, drawedGeometry])

  const checkedVessels = useMemo(
    () =>
      _vessels.map(vessel => ({
        ...vessel,
        checked: allVesselsChecked
      })),
    [_vessels, allVesselsChecked]
  )

  useEffect(() => {
    if (checkedVessels?.length) {
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
        dispatch(getFilteredVessels(checkedVessels, filters)).then(_filteredVessels => {
          const nextVessels = _filteredVessels.map(vessel => ({
            ...vessel,
            vesselProperties: {
              ...vessel.vesselProperties,
              flagState: vessel.vesselProperties.flagState.toLowerCase()
            }
          }))
          setFilteredVessels(nextVessels)
          setVesselsCountShowed(_filteredVessels.length)
        })
      }, 0)
    }
  }, [
    dispatch,
    checkedVessels,
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

  const selectBox = useCallback(() => {
    dispatch(addVesselListFilterZone(InteractionType.SQUARE))
    dispatch(setBlockVesselsUpdate(true))
  }, [dispatch])

  const selectPolygon = useCallback(() => {
    dispatch(addVesselListFilterZone(InteractionType.POLYGON))
    dispatch(setBlockVesselsUpdate(true))
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
    dispatch(previewVessels(filteredVessels))
  }, [dispatch, filteredVessels])

  const setAdministrativeZonesFiltered = useCallback(
    (nextAdministrativeZonesFiltered: string[]) => {
      const withoutAdministrativeZones = zonesSelected.filter(zoneSelected => {
        if (zoneSelected.code === LayerType.FREE_DRAW) {
          return true
        }

        return nextAdministrativeZonesFiltered.find(zoneFiltered => zoneFiltered === zoneSelected.code)
      })
      dispatch(setZonesSelected(withoutAdministrativeZones))

      const zonesGeometryToFetch = nextAdministrativeZonesFiltered.map(zoneName =>
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
    },
    [dispatch, namespace, zonesFilter, zonesSelected]
  )

  const zones = useMemo(
    () => ({
      administrativeZonesFiltered,
      callRemoveZoneSelected,
      setAdministrativeZonesFiltered,
      setZonesFilter: setZonesFilterCallback,
      zonesFilter,
      zonesSelected
    }),
    [
      administrativeZonesFiltered,
      callRemoveZoneSelected,
      setAdministrativeZonesFiltered,
      setZonesFilterCallback,
      zonesFilter,
      zonesSelected
    ]
  )

  return (
    <>
      <StyledModalHeader $isFull>
        <Modal.Title>
          <VesselIcon $background={THEME.color.charcoal} $isRightMenuShrinked={undefined} $isTitle />
          Liste des navires avec VMS
        </Modal.Title>
      </StyledModalHeader>
      <Modal.Body>
        <LegacyRsuiteComponentsWrapper>
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
              fleetSegments: getFleetSegmentsQuery.data || [],
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
            zones={zones}
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
            vesselsCountShowed={vesselsCountShowed}
            vesselsCountTotal={vesselsCountTotal}
          />
        </LegacyRsuiteComponentsWrapper>
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
        <BlackButton $isLast={false} data-cy="save-filter-modal" disabled={hasNoFilter()} onClick={() => saveFilter()}>
          Enregistrer le filtre
        </BlackButton>
        <BlackButton
          $isLast
          data-cy="download-vessels-modal"
          disabled={!filteredVessels?.some(vessel => vessel.checked)}
          onClick={() => download()}
        >
          Télécharger le tableau
        </BlackButton>
      </Modal.Footer>
      <DownloadVesselListModal
        filteredVessels={filteredVessels}
        isOpen={downloadVesselListModalIsOpen}
        setIsOpen={setDownloadVesselListModalIsOpen}
      />
      <SaveVesselFiltersModal
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
        onClose={onClose}
        setIsOpen={setSaveVesselFilterModalIsOpen}
      />
    </>
  )
}

const PreviewButton = styled(SecondaryButton)`
  float: left;
  margin-left: 25px;
  padding-left: 5px;
`

const BlackButton = styled(PrimaryButton)<{
  $isLast: boolean
}>`
  margin: 20px ${p => (p.$isLast ? '20px' : '0')} 20px 10px;
  font-size: 13px;
  color: ${p => p.theme.color.gainsboro};
`

const Title = styled.div`
  font-size: 16px;
  color: ${p => p.theme.color.slateGray};
  font-weight: 500;
`

const Preview = styled(PreviewSVG)`
  width: 23px;
  margin-right: 8px;
  vertical-align: text-top;
`
