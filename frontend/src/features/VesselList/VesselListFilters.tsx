import React, { useCallback, useMemo, useState } from 'react'
import { Checkbox, CheckboxGroup, MultiCascader, SelectPicker, Tag, TagPicker } from 'rsuite'
import styled from 'styled-components'

import { lastControlAfterLabels, lastPositionTimeAgoLabels } from './dataFormatting'
import { COUNTRIES_AS_ALPHA2_OPTIONS } from '../../constants'
import { COLORS } from '../../constants/constants'
import { LayerType as LayersType } from '../../domain/entities/layers/constants'
import { VesselLocation, vesselSize } from '../../domain/entities/vessel/vessel'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { getZonesAndSubZonesPromises } from '../AdministrativeZone/useCases/getZonesAndSubZonesPromises'
import PolygonFilterSVG from '../icons/Filtre_zone_polygone.svg?react'
import BoxFilterSVG from '../icons/Filtre_zone_rectangle.svg?react'
import FilterTag from '../MapButtons/VesselFilters/FilterTag'

function renderTagPickerMenuItem(item) {
  return <Label data-cy={`select-picker-menu-item-${item.label}`}>{item.label}</Label>
}

function renderTagPickerValue(items) {
  return items.map(tag => <Tag key={tag.label}>{tag.label}</Tag>)
}

const tagPickerStyle = { margin: '3px 10px 10px 0', verticalAlign: 'top', width: 160 }

function UnmemoizedVesselListFilters({
  controls,
  countries,
  districts,
  fleetSegments,
  gears,
  geometrySelection,
  lastPositionTimeAgo,
  location,
  seeMore,
  size,
  species,
  zones
}) {
  const dispatch = useMainAppDispatch()
  const [zoneGroups, setZoneGroups] = useState<string[]>([])

  const fleetSegmentsField = useMemo(() => {
    if (!fleetSegments.fleetSegments?.length) {
      return []
    }

    return fleetSegments.fleetSegments.map(segment => ({
      label: `${segment.segment} (${segment.segmentName})`,
      value: segment.segment
    }))
  }, [fleetSegments.fleetSegments])

  const gearsField = useMemo(() => {
    if (!gears.gears?.length) {
      return []
    }

    return gears.gears.map(gear => ({
      label: `${gear.code} (${gear.name})`,
      value: gear.code
    }))
  }, [gears.gears])

  const speciesField = useMemo(() => {
    if (!species.species?.length) {
      return []
    }

    return species.species.map(_species => ({
      label: _species,
      value: _species
    }))
  }, [species.species])

  const districtsField = useMemo(() => {
    if (!districts.districts || !districts.districts.length) {
      return []
    }

    return districts.districts.map(district => ({
      label: `${district.district} (${district.districtCode})`,
      value: district.district
    }))
  }, [districts.districts])

  const { callRemoveZoneSelected, zonesSelected } = zones
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
                  removeTagFromFilter={() => callRemoveZoneSelected(zoneSelected)}
                  text="Effacer la zone définie"
                  type={undefined}
                  uuid={undefined}
                  value="Effacer la zone définie"
                />
              </InlineTagWrapper>
            ))
        : null,
    [zonesSelected, callRemoveZoneSelected]
  )

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

    zones.setZonesFilter(nextZonesWithoutNulls)
  }, [dispatch, zones])

  return (
    <Filters>
      <FilterDesc>Dernières positions depuis </FilterDesc>
      <SelectWrapper>
        <SelectPicker
          data={lastPositionTimeAgoLabels}
          onChange={lastPositionTimeAgo.setLastPositionTimeAgoFilter}
          placeholder="x heures..."
          searchable={false}
          value={lastPositionTimeAgo.lastPositionTimeAgoFilter}
        />
      </SelectWrapper>
      <TagPicker
        data={COUNTRIES_AS_ALPHA2_OPTIONS}
        data-cy="vessel-list-country-filter"
        onChange={countries.setCountriesFiltered}
        placeholder="Nationalité"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={countries.countriesFiltered}
      />
      <TagPicker
        data={fleetSegmentsField}
        data-cy="vessel-list-fleet-segment-filter"
        onChange={fleetSegments.setFleetSegmentsFiltered}
        placeholder="Seg. de flotte"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={fleetSegments.fleetSegmentsFiltered}
      />
      <TagPicker
        data={gearsField}
        onChange={gears.setGearsFiltered}
        placeholder="Engins à bord"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={gears.gearsFiltered}
      />
      <TagPicker
        data={speciesField}
        onChange={species.setSpeciesFiltered}
        placeholder="Espèces à bord"
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
        style={tagPickerStyle}
        value={species.speciesFiltered}
      />
      <ZoneFilter>
        <MultiCascader
          data={zones.zonesFilter}
          menuWidth={250}
          onChange={zones.setAdministrativeZonesFiltered}
          onClean={() => zones.setAdministrativeZonesFiltered([])}
          onEnter={() => getZones()}
          placeholder="Filtrer avec une zone existante"
          style={{ margin: '0 10px 10px -10px', verticalAlign: 'top', width: 200 }}
          uncheckableItemValues={zoneGroups}
          value={zones.administrativeZonesFiltered}
        />
        <CustomZone>ou définir une zone</CustomZone>
        <BoxFilter data-cy="vessels-list-box-filter" onClick={geometrySelection.selectBox} />
        <PolygonFilter onClick={geometrySelection.selectPolygon} />
        {showZonesSelected()}
      </ZoneFilter>
      <br />
      <CheckboxGroup
        inline
        name="checkboxList"
        onChange={location.setVesselsLocationFilter}
        style={{ color: COLORS.slateGray, display: 'inline-block', height: 40 }}
        value={location.vesselsLocationFilter}
      >
        <Checkbox value={VesselLocation.SEA}>
          <Gray>Navires en mer</Gray>
        </Checkbox>
        <Checkbox data-cy="filter-vessel-at-port" value={VesselLocation.PORT}>
          <Gray>Navires au port</Gray>
        </Checkbox>
      </CheckboxGroup>
      <br />
      {seeMore.seeMoreIsOpen ? (
        <>
          <FilterDesc>Dernier contrôle il y a plus de </FilterDesc>
          <SelectWrapper>
            <SelectPicker
              data={lastControlAfterLabels}
              onChange={controls.setLastControlMonthsAgo}
              placeholder="x mois..."
              searchable={false}
              style={{ margin: '2px 10px 10px 0', width: 70 }}
              value={controls.lastControlMonthsAgo}
            />
          </SelectWrapper>
          <TagPicker
            data={districtsField}
            onChange={districts.setDistrictsFiltered}
            placeholder="Quartiers"
            renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
            renderValue={(_, items) => renderTagPickerValue(items)}
            style={tagPickerStyle}
            value={districts.districtsFiltered}
          />
          <VesselSize>Taille du navire</VesselSize>
          <CheckboxGroup
            inline
            name="checkboxList"
            onChange={size.setVesselsSizeValuesChecked}
            style={{ color: COLORS.slateGray, display: 'inline-block' }}
            value={size.vesselsSizeValuesChecked}
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
      <SeeMore onClick={() => seeMore.setSeeMoreIsOpen(!seeMore.seeMoreIsOpen)}>
        Voir {seeMore.seeMoreIsOpen ? 'moins' : 'plus'} de critères
      </SeeMore>
    </Filters>
  )
}

const InlineTagWrapper = styled.div`
  display: inline-block;
  vertical-align: top;
`

const Gray = styled.span`
  color: ${COLORS.slateGray};
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
  color: ${COLORS.slateGray};
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
  color: ${COLORS.slateGray};
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
