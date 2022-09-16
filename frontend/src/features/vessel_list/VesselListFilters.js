import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Checkbox, CheckboxGroup, MultiCascader, SelectPicker, Tag, TagPicker } from 'rsuite'
import { lastControlAfterLabels, lastPositionTimeAgoLabels } from './dataFormatting'
import { layersType as LayersType } from '../../domain/entities/layers'
import { COLORS } from '../../constants/constants'
import { ReactComponent as BoxFilterSVG } from '../icons/Filtre_zone_rectangle.svg'
import { ReactComponent as PolygonFilterSVG } from '../icons/Filtre_zone_polygone.svg'
import Countries from 'i18n-iso-countries'
import { VesselLocation, vesselSize } from '../../domain/entities/vessel'
import FilterTag from '../map/tools/vessel_filters/FilterTag'

Countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))
const countriesField = Object.keys(Countries.getAlpha2Codes()).map(country => {
  return {
    value: country.toLowerCase(),
    label: Countries.getName(country, 'fr')
  }
})

function renderTagPickerMenuItem (item) {
  return (
    <Label data-cy={`select-picker-menu-item-${item.label}`}>
      {item.label}
    </Label>
  )
}

function renderTagPickerValue (items) {
  return items.map((tag) => (
    <Tag key={tag.label}>
      {tag.label}
    </Tag>
  ))
}

const tagPickerStyle = { width: 160, margin: '2px 10px 10px 0', verticalAlign: 'top' }

const VesselListFilters = ({
  lastPositionTimeAgo,
  countries,
  fleetSegments,
  gears,
  species,
  districts,
  zones,
  geometrySelection,
  seeMore,
  size,
  controls,
  location
}) => {
  const fleetSegmentsField = useMemo(() => {
    if (fleetSegments.fleetSegments && fleetSegments.fleetSegments.length) {
      return fleetSegments.fleetSegments.map(segment => {
        return {
          value: segment.segment,
          label: `${segment.segment} (${segment.segmentName})`
        }
      })
    }
  }, [fleetSegments.fleetSegments])

  const gearsField = useMemo(() => {
    if (gears.gears && gears.gears.length) {
      return gears.gears.map(gear => {
        return {
          value: gear.code,
          label: `${gear.code} (${gear.name})`
        }
      })
    }
  }, [gears.gears])

  const speciesField = useMemo(() => {
    if (species.species && species.species.length) {
      return species.species.map(_species => {
        return {
          value: _species,
          label: _species
        }
      })
    }
  }, [species.species])

  const districtsField = useMemo(() => {
    if (!districts.districts || !districts.districts.length) {
      return []
    }

    return districts.districts.map(district => {
      return {
        value: district.district,
        label: `${district.district} (${district.districtCode})`
      }
    })
  }, [districts.districts])

  const { zonesSelected, callRemoveZoneSelected } = zones
  const showZonesSelected = useCallback(() => {
    return zonesSelected?.length && zonesSelected.find(zone => zone.code === LayersType.FREE_DRAW)
      ? zonesSelected.filter(zone => zone.code === LayersType.FREE_DRAW).map((zoneSelected, index) => {
        return <InlineTagWrapper key={zoneSelected.code}>
          <FilterTag
            key={zoneSelected.code}
            value={'Effacer la zone définie'}
            text={'Effacer la zone définie'}
            removeTagFromFilter={() => callRemoveZoneSelected(zoneSelected)}
          />
        </InlineTagWrapper>
      })
      : null
  }, [zonesSelected, callRemoveZoneSelected])

  return (
    <Filters>
      <FilterDesc>
        Dernières positions depuis {' '}
      </FilterDesc>
      <SelectWrapper>
        <SelectPicker
          style={{ width: 70, margin: '2px 10px 10px 0' }}
          searchable={false}
          placeholder="x heures..."
          value={lastPositionTimeAgo.lastPositionTimeAgoFilter}
          onChange={lastPositionTimeAgo.setLastPositionTimeAgoFilter}
          data={lastPositionTimeAgoLabels}
        />
      </SelectWrapper>
      <TagPicker
        data-cy={'vessel-list-country-filter'}
        value={countries.countriesFiltered}
        style={tagPickerStyle}
        data={countriesField}
        placeholder="Nationalité"
        onChange={countries.setCountriesFiltered}
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
      />
      <TagPicker
        data-cy={'vessel-list-fleet-segment-filter'}
        value={fleetSegments.fleetSegmentsFiltered}
        style={tagPickerStyle}
        data={fleetSegmentsField}
        placeholder="Seg. de flotte"
        onChange={fleetSegments.setFleetSegmentsFiltered}
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
      />
      <TagPicker
        value={gears.gearsFiltered}
        style={tagPickerStyle}
        data={gearsField}
        placeholder="Engins à bord"
        onChange={gears.setGearsFiltered}
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
      />
      <TagPicker
        value={species.speciesFiltered}
        style={tagPickerStyle}
        data={speciesField}
        placeholder="Espèces à bord"
        onChange={species.setSpeciesFiltered}
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
      />
      <ZoneFilter>
        <MultiCascader
          data={zones.zonesFilter}
          style={{ width: 200, verticalAlign: 'top', margin: '0 10px 10px -10px' }}
          placeholder="Filtrer avec une zone existante"
          menuWidth={250}
          uncheckableItemValues={zones.zoneGroups}
          value={zones.administrativeZonesFiltered}
          onClean={() => zones.setAdministrativeZonesFiltered([])}
          onChange={zones.setAdministrativeZonesFiltered}
        />
        <CustomZone>
          ou définir une zone
        </CustomZone>
        <BoxFilter data-cy={'vessels-list-box-filter'} onClick={geometrySelection.selectBox}/>
        <PolygonFilter onClick={geometrySelection.selectPolygon}/>
        {
          showZonesSelected()
        }
      </ZoneFilter><br/>
      <CheckboxGroup
        inline
        name="checkboxList"
        value={location.vesselsLocationFilter}
        onChange={location.setVesselsLocationFilter}
        style={{ display: 'inline-block', color: COLORS.slateGray, height: 40, marginLeft: -15 }}
      >
        <Checkbox value={VesselLocation.SEA}><Gray>Navires en mer</Gray></Checkbox>
        <Checkbox value={VesselLocation.PORT} data-cy={'filter-vessel-at-port'}><Gray>Navires au port</Gray></Checkbox>
      </CheckboxGroup><br/>
      {
        seeMore.seeMoreIsOpen
          ? <>
            <FilterDesc>
              Dernier contrôle il y a plus de {' '}
            </FilterDesc>
            <SelectWrapper>
              <SelectPicker
                style={{ width: 70, margin: '2px 10px 10px 0' }}
                searchable={false}
                placeholder="x mois..."
                value={controls.lastControlMonthsAgo}
                onChange={controls.setLastControlMonthsAgo}
                data={lastControlAfterLabels}
              />
            </SelectWrapper>
            <TagPicker
              value={districts.districtsFiltered}
              style={tagPickerStyle}
              data={districtsField}
              placeholder="Quartiers"
              onChange={districts.setDistrictsFiltered}
              renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
              renderValue={(_, items) => renderTagPickerValue(items)}
            />
            <VesselSize>
              Taille du navire
            </VesselSize>
            <CheckboxGroup
              inline
              name="checkboxList"
              value={size.vesselsSizeValuesChecked}
              onChange={size.setVesselsSizeValuesChecked}
              style={{ display: 'inline-block', color: COLORS.slateGray }}
            >
              <Checkbox value={vesselSize.BELOW_TEN_METERS.code}><Gray>Moins de 10 m</Gray></Checkbox>
              <Checkbox value={vesselSize.BELOW_TWELVE_METERS.code}><Gray>Moins de 12 m</Gray></Checkbox>
              <Checkbox value={vesselSize.ABOVE_TWELVE_METERS.code}><Gray>Plus de 12 m</Gray></Checkbox>
            </CheckboxGroup>
            <br/>
          </>
          : null
      }
      <SeeMore
        onClick={() => seeMore.setSeeMoreIsOpen(!seeMore.seeMoreIsOpen)}
      >
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
