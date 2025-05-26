import { useGetDistrictsQuery } from '@api/district'
import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { InteractionListener } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, BLUEFIN_TUNA_SPECY_CODE } from '@features/PriorNotification/constants'
import { VesselEmitsPosition, VesselLocation } from '@features/Vessel/types/vessel'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'
import { filterVesselsWithZone } from '@features/Vessel/useCases/VesselListV2/filterVesselsWithZone'
import { updateCustomZoneAndFilterVessels } from '@features/Vessel/useCases/VesselListV2/updateCustomZoneAndFilterVessels'
import { useGetFilterableZonesAsTreeOptions } from '@hooks/useGetFilterableZonesAsTreeOptions'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetOrganizationMembershipNamesAsOptions } from '@hooks/useGetOrganizationMembershipNamesAsOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, CheckPicker, MultiCascader, Select, Size, TextInput } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { uniq } from 'lodash-es'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import {
  HAS_LOGBOOK_AS_OPTIONS,
  LAST_CONTROL_PERIODS_AS_OPTIONS,
  LAST_POSITION_AS_OPTIONS,
  LastControlPeriod,
  RISK_FACTOR_AS_OPTIONS,
  VESSEL_SIZE_AS_OPTIONS,
  VesselSize
} from './constants'

export function FilterBar() {
  const dispatch = useMainAppDispatch()
  const listFilterValues = useMainAppSelector(store => store.vessel.listFilterValues)
  const areMoreFiltersDisplayed = useMainAppSelector(store => store.vesselList.areMoreFiltersDisplayed)

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { data: districtsAsTreeOptions } = useGetDistrictsQuery()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const filterableZoneAsTreeOptions = useGetFilterableZonesAsTreeOptions()
  const organizationMembershipNames = useGetOrganizationMembershipNamesAsOptions()
  const [searchQuery, setSearchQuery] = useState<string | undefined>(listFilterValues.searchQuery)

  useEffect(() => {
    setSearchQuery(listFilterValues.searchQuery)
  }, [listFilterValues.searchQuery])

  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.VESSELS_LIST)

  useEffect(() => {
    if (drawedGeometry) {
      dispatch(updateCustomZoneAndFilterVessels())
    }
  }, [dispatch, drawedGeometry])

  const speciesAsCodeOptions =
    speciesAsOptions?.map(option => ({ label: option.label, value: option.value.code })) ?? []

  const filterVesselsWithQuery = useDebouncedCallback((nextSearchQuery: string | undefined) => {
    dispatch(filterVessels({ searchQuery: nextSearchQuery }))
  }, 250)

  const updateSearchQuery = (nextSearchQuery: string | undefined) => {
    setSearchQuery(nextSearchQuery)
    filterVesselsWithQuery(nextSearchQuery)
  }

  const updateCountryCodes = (nextCountryCodes: string[] | undefined) => {
    dispatch(filterVessels({ countryCodes: nextCountryCodes ?? [] }))
  }

  const updateDistrictCodes = (nextDistrictCodes: string[] | undefined) => {
    dispatch(filterVessels({ districtCodes: nextDistrictCodes ?? [] }))
  }

  const updateRiskFactors = (nextRiskFactors: number[] | undefined) => {
    dispatch(filterVessels({ riskFactors: nextRiskFactors ?? [] }))
  }

  const updateFleetSegments = (nextfleetSegments: string[] | undefined) => {
    dispatch(filterVessels({ fleetSegments: nextfleetSegments ?? [] }))
  }

  const updateGearCodes = (nextGearCodes: string[] | undefined) => {
    dispatch(filterVessels({ gearCodes: nextGearCodes ?? [] }))
  }

  const updateZones = async (nextZonesNames: string[] | undefined) => {
    assertNotNullish(filterableZoneAsTreeOptions)
    const nextZones = await dispatch(
      filterVesselsWithZone(filterableZoneAsTreeOptions, InteractionListener.VESSELS_LIST, nextZonesNames)
    )
    if (nextZones !== undefined) {
      dispatch(filterVessels({ zones: nextZones }))
    }
  }

  const updateNonCustomZones = async (nextZonesNames: string[] | undefined) => {
    const nextZonesNamesWithCustomZone = listFilterValues.zones?.some(
      zone => zone.value === MonitorFishMap.MonitorFishLayer.CUSTOM
    )
      ? nextZonesNames?.concat(MonitorFishMap.MonitorFishLayer.CUSTOM)
      : nextZonesNames

    updateZones(nextZonesNamesWithCustomZone)
  }

  const updateCustomZones = async (checked: boolean | undefined) => {
    const zones = listFilterValues.zones?.map(zone => zone.value) ?? []

    updateZones(
      checked
        ? zones.concat(MonitorFishMap.MonitorFishLayer.CUSTOM)
        : zones.filter(zone => zone === MonitorFishMap.MonitorFishLayer.CUSTOM)
    )
  }

  const updateLastControlPeriod = (nextLastControlPeriod: LastControlPeriod | undefined) => {
    dispatch(filterVessels({ lastControlPeriod: nextLastControlPeriod }))
  }

  const updateVesselSize = (nextVesselSize: VesselSize | undefined) => {
    dispatch(filterVessels({ vesselSize: nextVesselSize }))
  }

  const updateLastLandingPortLocodes = (nextPortLocodes: string[] | undefined) => {
    dispatch(filterVessels({ lastLandingPortLocodes: nextPortLocodes ?? [] }))
  }

  const updateProducerOrganizations = (nextProducerOrganizations: string[] | undefined) => {
    dispatch(filterVessels({ producerOrganizations: nextProducerOrganizations ?? [] }))
  }

  const updateLastPositionHoursAgo = (nextLastPositionHoursAgo: number | undefined) => {
    dispatch(filterVessels({ lastPositionHoursAgo: nextLastPositionHoursAgo }))
  }

  const updateHasLogbook = (nextHasLogbook: boolean | undefined) => {
    dispatch(filterVessels({ hasLogbook: nextHasLogbook }))
  }

  const isAtSea = !!listFilterValues.vesselsLocation?.includes(VesselLocation.SEA)
  const isAtPort = !!listFilterValues.vesselsLocation?.includes(VesselLocation.PORT)

  const emitsPositions = !!listFilterValues.emitsPositions?.includes(VesselEmitsPosition.YES)
  const emitsNoPositions = !!listFilterValues.emitsPositions?.includes(VesselEmitsPosition.NO)

  const updateVesselLocationAtSea = (nextAtSea: boolean | undefined) => {
    const nextVesselsLocation = nextAtSea ? [VesselLocation.SEA] : []
    const previousAtPort = isAtPort ? [VesselLocation.PORT] : []
    dispatch(filterVessels({ vesselsLocation: previousAtPort.concat(nextVesselsLocation) }))
  }

  const updateVesselLocationAtPort = (nextAtPort: boolean | undefined) => {
    const nextVesselsLocation = nextAtPort ? [VesselLocation.PORT] : []
    const previousAtSea = isAtSea ? [VesselLocation.SEA] : []
    dispatch(filterVessels({ vesselsLocation: previousAtSea.concat(nextVesselsLocation) }))
  }

  const updateEmitsPositions = (value: boolean | undefined) => {
    const nextEmitsPositions = value ? [VesselEmitsPosition.YES] : []
    const previousEmitsNoPositions = emitsNoPositions ? [VesselEmitsPosition.NO] : []
    dispatch(filterVessels({ emitsPositions: previousEmitsNoPositions.concat(nextEmitsPositions) }))
  }

  const updateEmitsNoPositions = (value: boolean | undefined) => {
    const nextEmitsNoPositions = value ? [VesselEmitsPosition.NO] : []
    const previousEmitsPositions = emitsNoPositions ? [VesselEmitsPosition.YES] : []
    dispatch(filterVessels({ emitsPositions: previousEmitsPositions.concat(nextEmitsNoPositions) }))
  }

  const updateSpecyCodes = (nextSpecyCodes: string[] | undefined) => {
    const normalizedNextSpecyCodes = nextSpecyCodes?.includes(BLUEFIN_TUNA_SPECY_CODE)
      ? uniq([...nextSpecyCodes, ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES])
      : nextSpecyCodes

    dispatch(filterVessels({ specyCodes: normalizedNextSpecyCodes ?? [] }))
  }

  const renderMultiCascaderCustomZoneFooter = () => (
    <MultiCascaderCustomZone>
      <Checkbox
        checked={listFilterValues.zones?.some(zone => zone.value === MonitorFishMap.MonitorFishLayer.CUSTOM)}
        inline
        label="Filtrer avec une zone dessinée sur la carte"
        name="custom_zone"
        onChange={updateCustomZones}
      >
        Filtrer avec une zone dessinée sur la carte
      </Checkbox>
    </MultiCascaderCustomZone>
  )

  return (
    <Wrapper className="vessel-list-filter-bar">
      <Row>
        <TextInput
          isLabelHidden
          isSearchInput
          isTransparent
          label="Rechercher un navire"
          name="searchQuery"
          onChange={updateSearchQuery}
          placeholder="Rechercher un navire"
          size={Size.LARGE}
          value={searchQuery}
        />
      </Row>

      <Row>
        <CheckPicker
          isLabelHidden
          isTransparent
          label="Nationalités"
          name="countryCodes"
          onChange={updateCountryCodes}
          options={COUNTRIES_AS_ALPHA2_OPTIONS}
          placeholder="Nationalité"
          popupWidth={240}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Nationalités ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.countryCodes}
          virtualized
        />
        <CheckPicker
          isLabelHidden
          isTransparent
          label="Note de risque"
          name="riskFactors"
          onChange={updateRiskFactors}
          options={RISK_FACTOR_AS_OPTIONS}
          placeholder="Note de risque"
          popupWidth={240}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Notes de risque ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.riskFactors}
          virtualized
        />
        <CheckPicker
          disabled={!fleetSegmentsAsOptions}
          isLabelHidden
          isTransparent
          label="Segments de flotte"
          name="fleetSegments"
          onChange={updateFleetSegments}
          options={fleetSegmentsAsOptions ?? []}
          placeholder="Segments de flotte"
          popupWidth={320}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Segments de flotte ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.fleetSegments}
          virtualized
        />
        <MultiCascader
          disabled={!gearsAsTreeOptions}
          isLabelHidden
          isTransparent
          label="Engins utilisés"
          name="gearCodes"
          onChange={updateGearCodes}
          options={gearsAsTreeOptions ?? []}
          placeholder="Engins utilisés"
          popupWidth={500}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Engins utilisés ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.gearCodes}
        />
        <CheckPicker
          disabled={!speciesAsCodeOptions}
          isLabelHidden
          isTransparent
          label="Espèces à bord"
          name="specyCodes"
          onChange={updateSpecyCodes}
          options={speciesAsCodeOptions ?? []}
          placeholder="Espèces à bord"
          popupWidth={320}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Espèces à bord ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.specyCodes}
          virtualized
        />
        <MultiCascader
          disabled
          isLabelHidden
          isTransparent
          label="Dernier port de débarque"
          name="lastLandingPortLocodes"
          onChange={updateLastLandingPortLocodes}
          options={portsAsTreeOptions ?? []}
          placeholder="Dernier port de débarque"
          popupWidth={500}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Dernier port de débarque ({items.length})</SelectValue> : <></>
          }
          searchable
          style={{ width: 210 }}
          value={listFilterValues.lastLandingPortLocodes}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Dernier contrôle"
          name="lastControlPeriod"
          onChange={updateLastControlPeriod}
          options={LAST_CONTROL_PERIODS_AS_OPTIONS}
          placeholder="Dernier contrôle"
          popupWidth={224}
          value={listFilterValues.lastControlPeriod}
        />
        <CheckPicker
          disabled
          isLabelHidden
          isTransparent
          label="Adhésion à une OP"
          name="producerOrganizations"
          onChange={updateProducerOrganizations}
          options={organizationMembershipNames}
          placeholder="Adhésion à une OP"
          popupWidth={320}
          renderValue={(_, items) => (items.length > 0 ? <SelectValue>OP ({items.length})</SelectValue> : <></>)}
          searchable
          value={listFilterValues.producerOrganizations}
        />
        <MultiCascader
          disabled={!filterableZoneAsTreeOptions}
          isLabelHidden
          isTransparent
          label="Filtrer les navires avec une zone"
          name="zones"
          onChange={updateNonCustomZones}
          options={filterableZoneAsTreeOptions?.filter(zone => zone.label !== 'Zone manuelle') ?? []}
          placeholder="Filtrer les navires avec une zone"
          popupWidth={500}
          renderExtraFooter={renderMultiCascaderCustomZoneFooter}
          renderValue={(_, items) => {
            const itemsChildrens = items.filter(item => item.parent !== null)

            return itemsChildrens.length > 0 ? (
              <SelectValue>Zone de filtre ({itemsChildrens.length})</SelectValue>
            ) : (
              <></>
            )
          }}
          searchable
          style={{ width: 416 }}
          uncheckableItemValues={['0', '1', '2', '3']}
          value={listFilterValues.zones?.map(zone => zone.value)}
        />
        {areMoreFiltersDisplayed && (
          <>
            <MultiCascader
              isLabelHidden
              isTransparent
              label="Quartier"
              name="districtCodes"
              onChange={updateDistrictCodes}
              options={districtsAsTreeOptions ?? []}
              placeholder="Quartier"
              popupWidth={500}
              renderValue={(_, items) =>
                items.length > 0 ? <SelectValue>Quartier ({items.length})</SelectValue> : <></>
              }
              searchable
              value={listFilterValues.districtCodes}
            />
            <Select
              isLabelHidden
              isTransparent
              label="Longueur du navire"
              name="vesselSize"
              onChange={updateVesselSize}
              options={VESSEL_SIZE_AS_OPTIONS}
              placeholder="Longueur du navire"
              value={listFilterValues.vesselSize}
            />
            <Select
              isLabelHidden
              isTransparent
              label="Dernière position VMS"
              name="lastPositionHoursAgo"
              onChange={updateLastPositionHoursAgo}
              options={LAST_POSITION_AS_OPTIONS}
              placeholder="Dernière position VMS"
              value={listFilterValues.lastPositionHoursAgo}
            />
            <Select
              isLabelHidden
              isTransparent
              label="Equipé JPE"
              name="hasLogbook"
              onChange={updateHasLogbook}
              options={HAS_LOGBOOK_AS_OPTIONS}
              placeholder="Equipé JPE"
              value={listFilterValues.hasLogbook}
            />
          </>
        )}
        <Checkbox checked={emitsPositions} label="Équipé VMS" name="emitsPositions" onChange={updateEmitsPositions} />
        <Checkbox
          checked={emitsNoPositions}
          label="Non équipé VMS"
          name="emitsNoPositions"
          onChange={updateEmitsNoPositions}
        />
        <VerticalBar />
        <Checkbox checked={isAtSea} label="En mer" name="always" onChange={updateVesselLocationAtSea} />
        <Checkbox checked={isAtPort} label="À quai" name="always" onChange={updateVesselLocationAtPort} />
      </Row>
    </Wrapper>
  )
}

const VerticalBar = styled.span`
  background: ${p => p.theme.color.lightGray};
  height: 20px;
  width: 2px;
  margin-top: 16px;
  margin-left: 16px;
`

const MultiCascaderCustomZone = styled.div`
  border-top: 1px solid ${p => p.theme.color.lightGray};
  padding: 8px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;

  > .Element-Field {
    margin-top: 16px;
    margin-left: 16px;
  }

  > .Field-MultiCascader,
  > .Field-CheckPicker,
  > .Field-Select,
  > .Element-Fieldset {
    min-width: 200px;
    width: 160px;
  }

  > .Field-TextInput {
    min-width: 280px;
  }

  > .Field-MultiCheckbox {
    min-width: 320px;
  }
`

const SelectValue = styled.span`
  display: flex;
  overflow: hidden;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`
