import React, { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import SelectPicker from 'rsuite/lib/SelectPicker'
import { lastPositionTimeAgoLabels } from './dataFormatting'
import TagPicker from 'rsuite/lib/TagPicker'
import MultiCascader from 'rsuite/lib/MultiCascader'
import { layersType as LayersType } from '../../domain/entities/layers'
import { COLORS } from '../../constants/constants'
import { ReactComponent as BoxFilterSVG } from '../icons/Filtre_zone_rectangle.svg'
import { ReactComponent as PolygonFilterSVG } from '../icons/Filtre_zone_polygone.svg'
import Countries from 'i18n-iso-countries'
import Checkbox from 'rsuite/lib/Checkbox'
import CheckboxGroup from 'rsuite/lib/CheckboxGroup'
import { vesselSize } from '../../domain/entities/vessel'
import Tag from 'rsuite/lib/Tag'
import FilterTag from '../vessel_filters/FilterTag'

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
  size
}) => {
  const { current: countriesField } = useRef(Object.keys(Countries.getAlpha2Codes()).map(country => {
    return {
      value: country.toLowerCase(),
      label: Countries.getName(country, 'fr')
    }
  }))

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
      return species.species.map(species => {
        return {
          value: species,
          label: species
        }
      })
    }
  }, [species.species])

  const districtsField = useMemo(() => {
    if (districts.districts && districts.districts.length) {
      return districts.districts.map(district => {
        return {
          value: district.district,
          label: `${district.district} (${district.districtCode})`
        }
      })
    }
  }, [districts.districts])

  const showZonesSelected = useCallback(() => {
    return zones.zonesSelected && zones.zonesSelected.length && zones.zonesSelected.find(zone => zone.code === LayersType.FREE_DRAW)
      ? zones.zonesSelected.filter(zone => zone.code === LayersType.FREE_DRAW).map((zoneSelected, index) => {
        return <InlineTagWrapper>
          <FilterTag
            key={zoneSelected.code + index}
            value={'Effacer la zone définie'}
            text={'Effacer la zone définie'}
            removeTagFromFilter={() => zones.callRemoveZoneSelected(zoneSelected)}
          />
        </InlineTagWrapper>
      })
      : null
  }, [zones.zonesSelected])

  function renderTagPickerMenuItem (item) {
    return (
      <Label>
        {item.label}
      </Label>
    )
  }

  function renderTagPickerValue (items) {
    return items.map((tag, index) => (
      <Tag key={index}>
        {tag.label}
      </Tag>
    ))
  }

  const tagPickerStyle = { width: 160, margin: '2px 10px 10px 0', verticalAlign: 'top' }

  return (
    <Filters>
      <FilterDesc>
        Dernières positions depuis {' '}
      </FilterDesc>
      <TimeAgoSelect>
        <SelectPicker
          style={{ width: 70, margin: '2px 10px 10px 0' }}
          searchable={false}
          placeholder="x heures..."
          value={lastPositionTimeAgo.lastPositionTimeAgoFilter}
          onChange={lastPositionTimeAgo.setLastPositionTimeAgoFilter}
          data={lastPositionTimeAgoLabels}
        />
      </TimeAgoSelect>
      <TagPicker
        value={countries.countriesFiltered}
        style={tagPickerStyle}
        data={countriesField}
        placeholder="Nationalité"
        onChange={change => countries.setCountriesFiltered(change)}
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
      />
      <TagPicker
        value={fleetSegments.fleetSegmentsFiltered}
        style={tagPickerStyle}
        data={fleetSegmentsField}
        placeholder="Seg. de flotte"
        onChange={change => fleetSegments.setFleetSegmentsFiltered(change)}
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
      />
      <TagPicker
        value={gears.gearsFiltered}
        style={tagPickerStyle}
        data={gearsField}
        placeholder="Engins à bord"
        onChange={change => gears.setGearsFiltered(change)}
        renderMenuItem={(_, item) => renderTagPickerMenuItem(item)}
        renderValue={(_, items) => renderTagPickerValue(items)}
      />
      <TagPicker
        value={species.speciesFiltered}
        style={tagPickerStyle}
        data={speciesField}
        placeholder="Espèces à bord"
        onChange={change => species.setSpeciesFiltered(change)}
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
          onChange={change => zones.setAdministrativeZonesFiltered(change)}
        />
        <CustomZone>
          ou définir une zone
        </CustomZone>
        <BoxFilter onClick={() => geometrySelection.selectBox()}/>
        <PolygonFilter onClick={() => geometrySelection.selectPolygon()}/>
        {
          showZonesSelected()
        }
      </ZoneFilter><br/>
      {
        seeMore.seeMoreIsOpen
          ? <>
            <TagPicker
              value={districts.districtsFiltered}
              style={tagPickerStyle}
              data={districtsField}
              placeholder="Quartiers"
              onChange={change => districts.setDistrictsFiltered(change)}
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
              style={{ display: 'inline-block', color: COLORS.textGray }}
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
  color: ${COLORS.textGray};
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
  color: ${COLORS.textGray};
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

const TimeAgoSelect = styled.div`
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
  color: #969696;
  font-size: 13px;
  margin-top: 15px;
  margin-bottom: 15px;
  max-height: 147px;
  overflow: auto;
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
