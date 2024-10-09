import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import getAdministrativeZoneGeometry from '@features/AdministrativeZone/useCases/getAdministrativeZoneGeometry'
import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import {
  removeZoneSelected,
  setCountriesFiltered,
  setDistrictsFiltered,
  setFleetSegmentsFiltered,
  setGearsFiltered,
  setLastControlMonthsAgo,
  setLastPositionTimeAgoFilter,
  setSpeciesFiltered,
  setVesselsLocationFilter,
  setVesselsSizeValuesChecked,
  setZonesFilter,
  setZonesSelected
} from '@features/Vessel/components/VesselList/slice'
import { FilterTag } from '@features/VesselFilter/components/VesselFilters/FilterTag'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Checkbox, CheckboxGroup, MultiCascader, SelectPicker, Tag, TagPicker } from 'rsuite'
import styled from 'styled-components'

import { lastControlAfterLabels, lastPositionTimeAgoLabels } from './dataFormatting'
import { LayerType, LayerType as LayersType } from '../../../../domain/entities/layers/constants'
import { InteractionType } from '../../../../domain/entities/map/constants'
import { VesselLocation, vesselSize } from '../../../../domain/entities/vessel/vessel'
import { setBlockVesselsUpdate } from '../../../../domain/shared_slices/Global'
import { addVesselListFilterZone } from '../../../../domain/use_cases/vessel/addVesselListFilterZone'
import { getZonesAndSubZonesPromises } from '../../../AdministrativeZone/useCases/getZonesAndSubZonesPromises'
import PolygonFilterSVG from '../../../icons/Filtre_zone_polygone.svg?react'
import BoxFilterSVG from '../../../icons/Filtre_zone_rectangle.svg?react'

function renderTagPickerMenuItem(item) {
  return <Label data-cy={`select-picker-menu-item-${item.label}`}>{item.label}</Label>
}

function renderTagPickerValue(items) {
  return items.map(tag => <Tag key={tag.label}>{tag.label}</Tag>)
}

const tagPickerStyle = { margin: '3px 10px 10px 0', verticalAlign: 'top', width: 150 }

type VesselListFiltersProps = Readonly<{
  namespace: string
  seeMoreIsOpen: any
  setSeeMoreIsOpen: any
}>
function UnmemoizedVesselListFilters({ namespace, seeMoreIsOpen, setSeeMoreIsOpen }: VesselListFiltersProps) {
  const dispatch = useMainAppDispatch()
  const {
    countriesFiltered,
    districtsFiltered,
    fleetSegmentsFiltered,
    gearsFiltered,
    lastControlMonthsAgo,
    lastPositionTimeAgoFilter,
    speciesFiltered,
    vesselsLocationFilter,
    vesselsSizeValuesChecked,
    zonesFilter,
    zonesSelected
  } = useMainAppSelector(state => state.vesselList)
  const { uniqueVesselsDistricts: districts, uniqueVesselsSpecies: species } = useMainAppSelector(state => state.vessel)
  const gears = useMainAppSelector(state => state.gear.gears)
  const getFleetSegmentsQuery = useGetFleetSegmentsQuery()
  const [zoneGroups, setZoneGroups] = useState<string[]>([])

  const fleetSegmentsField = useMemo(() => {
    if (!getFleetSegmentsQuery?.data?.length) {
      return []
    }

    return getFleetSegmentsQuery.data.map(segment => ({
      label: `${segment.segment} (${segment.segmentName})`,
      value: segment.segment
    }))
  }, [getFleetSegmentsQuery])

  const gearsField = useMemo(() => {
    if (!gears?.length) {
      return []
    }

    return gears.map(gear => ({
      label: `${gear.code} (${gear.name})`,
      value: gear.code
    }))
  }, [gears])

  const speciesField = useMemo(() => {
    if (!species?.length) {
      return []
    }

    return species.map(_species => ({
      label: _species,
      value: _species
    }))
  }, [species])

  const districtsField = useMemo(() => {
    if (!districts || districts.length === 0) {
      return []
    }

    return districts.map(district => ({
      label: `${district.district} (${district.districtCode})`,
      value: district.district
    }))
  }, [districts])

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

  const showZonesSelected = useCallback(
    () =>
      zonesSelected?.length && zonesSelected.find(zone => zone.code === LayersType.FREE_DRAW)
        ? zonesSelected
            .filter(zone => zone.code === LayersType.FREE_DRAW)
            .map(zoneSelected => (
              <InlineTagWrapper key={zoneSelected.code}>
                <FilterTag
                  key={zoneSelected.code}
                  iconElement={undefined}
                  remove={() => callRemoveZoneSelected(zoneSelected)}
                  tag={{
                    type: 'zonesSelected',
                    value: 'Effacer la zone définie'
                  }}
                  text="Effacer la zone définie"
                  uuid={undefined}
                />
              </InlineTagWrapper>
            ))
        : null,
    [zonesSelected, callRemoveZoneSelected]
  )

  const administrativeZonesFiltered = useMemo(
    () =>
      zonesSelected
        .filter(zoneSelected => zoneSelected.code !== LayerType.FREE_DRAW)
        .map(zoneSelected => zoneSelected.code),
    [zonesSelected]
  )

  // TODO Export to a thunk use-case
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

  // TODO Export to a thunk use-case
  const getZones = useCallback(async () => {
    const nextZonesPromises = dispatch(getZonesAndSubZonesPromises())
    const nextZones = await Promise.all(nextZonesPromises)

    let nextZonesWithoutNulls = nextZones.flat().filter(zone => zone)

    const groups = Array.from(new Set(nextZonesWithoutNulls.map(zone => zone.group)))
    setZoneGroups(groups)

    nextZonesWithoutNulls = groups.map(group => ({
      children: nextZonesWithoutNulls.filter(zone => zone.group === group),
      label: group,
      value: group
    }))

    dispatch(setZonesFilter(nextZonesWithoutNulls))
  }, [dispatch])

  useEffect(() => {
    getZones()
  }, [getZones])

  return (
    <Filters>
      <FilterDesc>Dernières positions depuis </FilterDesc>
      <SelectWrapper>
        <SelectPicker
          data={lastPositionTimeAgoLabels}
          onChange={nextValue => dispatch(setLastPositionTimeAgoFilter(nextValue as number))}
          placeholder="x heures..."
          searchable={false}
          value={lastPositionTimeAgoFilter}
        />
      </SelectWrapper>
      <TagPicker
        data={COUNTRIES_AS_ALPHA2_OPTIONS}
        data-cy="vessel-list-country-filter"
        onChange={nextValue => dispatch(setCountriesFiltered(nextValue))}
        placeholder="Nationalité"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={countriesFiltered}
      />
      <TagPicker
        data={fleetSegmentsField}
        data-cy="vessel-list-fleet-segment-filter"
        onChange={nextValue => dispatch(setFleetSegmentsFiltered(nextValue))}
        placeholder="Seg. de flotte"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={fleetSegmentsFiltered}
      />
      <TagPicker
        data={gearsField}
        onChange={nextValue => dispatch(setGearsFiltered(nextValue))}
        placeholder="Engins à bord"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={gearsFiltered}
      />
      <TagPicker
        data={speciesField}
        onChange={nextValue => dispatch(setSpeciesFiltered(nextValue))}
        placeholder="Espèces à bord"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={speciesFiltered}
      />
      <ZoneFilter>
        {!!zonesFilter.length && !!zoneGroups?.length && (
          <MultiCascader
            // TODO A deep copy is required to prevent error : "can't define property "parent": Object is not extensible"
            data={zonesFilter.map(zone => JSON.parse(JSON.stringify(zone)))}
            menuWidth={250}
            onChange={nextValue => setAdministrativeZonesFiltered(nextValue as string[])}
            onClean={() => setAdministrativeZonesFiltered([])}
            placeholder="Filtrer avec une zone existante"
            style={{ margin: '0 10px 10px -10px', verticalAlign: 'top', width: 200 }}
            uncheckableItemValues={zoneGroups}
            value={administrativeZonesFiltered}
          />
        )}
        <CustomZone>ou définir une zone</CustomZone>
        <BoxFilter data-cy="vessels-list-box-filter" onClick={selectBox} />
        <PolygonFilter onClick={selectPolygon} />
        {showZonesSelected()}
      </ZoneFilter>
      <br />
      <CheckboxGroup
        inline
        name="checkboxList"
        onChange={nextValue => dispatch(setVesselsLocationFilter(nextValue as VesselLocation[]))}
        style={{ color: THEME.color.slateGray, display: 'inline-block', height: 40 }}
        value={vesselsLocationFilter}
      >
        <Checkbox value={VesselLocation.SEA}>
          <Gray>Navires en mer</Gray>
        </Checkbox>
        <Checkbox data-cy="filter-vessel-at-port" value={VesselLocation.PORT}>
          <Gray>Navires au port</Gray>
        </Checkbox>
      </CheckboxGroup>
      <br />
      {seeMoreIsOpen ? (
        <>
          <FilterDesc>Dernier contrôle il y a plus de </FilterDesc>
          <SelectWrapper>
            <SelectPicker
              data={lastControlAfterLabels}
              onChange={nextValue => dispatch(setLastControlMonthsAgo(nextValue))}
              placeholder="x mois..."
              searchable={false}
              style={{ margin: '2px 10px 10px 0', width: 70 }}
              value={lastControlMonthsAgo}
            />
          </SelectWrapper>
          <TagPicker
            data={districtsField}
            onChange={nextValue => dispatch(setDistrictsFiltered(nextValue))}
            placeholder="Quartiers"
            renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
            renderValue={(_, items) => renderTagPickerValue(items)}
            style={tagPickerStyle}
            value={districtsFiltered}
          />
          <VesselSize>Taille du navire</VesselSize>
          <CheckboxGroup
            inline
            name="checkboxList"
            onChange={nextValue => dispatch(setVesselsSizeValuesChecked(nextValue as string[]))}
            style={{ color: THEME.color.slateGray, display: 'inline-block' }}
            value={vesselsSizeValuesChecked}
          >
            <Checkbox value={vesselSize.BELOW_TEN_METERS.code}>
              <Gray>Moins de 10 m</Gray>
            </Checkbox>
            <Checkbox value={vesselSize.BELOW_TWELVE_METERS.code}>
              <Gray>Moins de 12 m</Gray>
            </Checkbox>
            <Checkbox value={vesselSize.ABOVE_TWELVE_METERS.code}>
              <Gray>Plus de 12 m</Gray>
            </Checkbox>
          </CheckboxGroup>
          <br />
        </>
      ) : null}
      <SeeMore onClick={() => setSeeMoreIsOpen(!seeMoreIsOpen)}>
        Voir {seeMoreIsOpen ? 'moins' : 'plus'} de critères
      </SeeMore>
    </Filters>
  )
}

const InlineTagWrapper = styled.div`
  display: inline-block;
  vertical-align: top;
`

const Gray = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-left: 2px;
  margin-right: 5px;
`

const VesselSize = styled.span`
  padding-top: 12px;
  display: inline-block;
  vertical-align: middle;
  margin-left: 20px;
  margin-right: 10px;
`

const SeeMore = styled.span`
  text-decoration: underline;
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
`

const CustomZone = styled.span`
  margin-left: 50px;
`

const ZoneFilter = styled.div`
  display: inline-block;
  margin-left: 10px;
  font-size: 13px;
`

const SelectWrapper = styled.div`
  width: 117px;
  display: inline-block;
  margin-right: 20px;
  margin-left: 10px;
`

const Label = styled.span`
  font-size: 13px;
`

const FilterDesc = styled.span`
  font-size: 13px;
  margin-top: 10px;
  display: inline-block;
`

const Filters = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  margin-top: 15px;
  margin-bottom: 15px;
`

const BoxFilter = styled(BoxFilterSVG)`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 5px;
  vertical-align: text-bottom;
`

const PolygonFilter = styled(PolygonFilterSVG)`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
  vertical-align: text-bottom;
`

export const VesselListFilters = React.memo(UnmemoizedVesselListFilters)
