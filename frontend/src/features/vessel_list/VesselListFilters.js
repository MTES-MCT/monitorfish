import Countries from 'i18n-iso-countries'
import React, { useCallback, useMemo } from 'react'
import { Checkbox, CheckboxGroup, MultiCascader, SelectPicker, Tag, TagPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { layersType as LayersType } from '../../domain/entities/layers'
import { VesselLocation, vesselSize } from '../../domain/entities/vessel'
import { ReactComponent as PolygonFilterSVG } from '../icons/Filtre_zone_polygone.svg'
import { ReactComponent as BoxFilterSVG } from '../icons/Filtre_zone_rectangle.svg'
import FilterTag from '../vessel_filters/FilterTag'
import { lastControlAfterLabels, lastPositionTimeAgoLabels } from './dataFormatting'

Countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

const countriesField = Object.keys(Countries.getAlpha2Codes()).map(country => ({
  label: Countries.getName(country, 'fr'),
  value: country.toLowerCase(),
}))

function renderTagPickerMenuItem(item) {
  return <Label data-cy={`select-picker-menu-item-${item.label}`}>{item.label}</Label>
}

function renderTagPickerValue(items) {
  return items.map(tag => <Tag key={tag.label}>{tag.label}</Tag>)
}

const tagPickerStyle = { margin: '2px 10px 10px 0', verticalAlign: 'top', width: 160 }

function VesselListFilters({
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
  zones,
}) {
  const fleetSegmentsField = useMemo(() => {
    if (fleetSegments.fleetSegments && fleetSegments.fleetSegments.length) {
      return fleetSegments.fleetSegments.map(segment => ({
        label: `${segment.segment} (${segment.segmentName})`,
        value: segment.segment,
      }))
    }
  }, [fleetSegments.fleetSegments])

  const gearsField = useMemo(() => {
    if (gears.gears && gears.gears.length) {
      return gears.gears.map(gear => ({
        label: `${gear.code} (${gear.name})`,
        value: gear.code,
      }))
    }
  }, [gears.gears])

  const speciesField = useMemo(() => {
    if (species.species && species.species.length) {
      return species.species.map(_species => ({
        label: _species,
        value: _species,
      }))
    }
  }, [species.species])

  const districtsField = useMemo(() => {
    if (!districts.districts || !districts.districts.length) {
      return []
    }

    return districts.districts.map(district => ({
      label: `${district.district} (${district.districtCode})`,
      value: district.district,
    }))
  }, [districts.districts])

  const { callRemoveZoneSelected, zonesSelected } = zones
  const showZonesSelected = useCallback(
    () =>
      zonesSelected?.length && zonesSelected.find(zone => zone.code === LayersType.FREE_DRAW)
        ? zonesSelected
            .filter(zone => zone.code === LayersType.FREE_DRAW)
            .map((zoneSelected, index) => (
              <InlineTagWrapper key={zoneSelected.code}>
                <FilterTag
                  key={zoneSelected.code}
                  removeTagFromFilter={() => callRemoveZoneSelected(zoneSelected)}
                  text="Effacer la zone définie"
                  value="Effacer la zone définie"
                />
              </InlineTagWrapper>
            ))
        : null,
    [zonesSelected, callRemoveZoneSelected],
  )

  return (
    <Filters>
      <FilterDesc>Dernières positions depuis </FilterDesc>
      <SelectWrapper>
        <SelectPicker
          data={lastPositionTimeAgoLabels}
          onChange={lastPositionTimeAgo.setLastPositionTimeAgoFilter}
          placeholder="x heures..."
          searchable={false}
          style={{ margin: '2px 10px 10px 0', width: 70 }}
          value={lastPositionTimeAgo.lastPositionTimeAgoFilter}
        />
      </SelectWrapper>
      <TagPicker
        data={countriesField}
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
          placeholder="Filtrer avec une zone existante"
          style={{ margin: '0 10px 10px -10px', verticalAlign: 'top', width: 200 }}
          uncheckableItemValues={zones.zoneGroups}
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
        style={{ color: COLORS.slateGray, display: 'inline-block', height: 40, marginLeft: -15 }}
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
  vertical-align: sub;
`

const SelectWrapper = styled.div`
  width: 117px;
  display: inline-block;
  margin-right: 20px;
  margin-left: 10px;
  vertical-align: sub;
`

const Label = styled.span`
  font-size: 13px;
`

const FilterDesc = styled.span`
  font-size: 13px;
  margin-top: 7px;
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

export default React.memo(VesselListFilters)
