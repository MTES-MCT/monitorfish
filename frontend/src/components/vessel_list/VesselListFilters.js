import React, { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import SelectPicker from 'rsuite/lib/SelectPicker'
import { getLastPositionTimeAgoLabels } from './dataFormatting'
import TagPicker from 'rsuite/lib/TagPicker'
import MultiCascader from 'rsuite/lib/MultiCascader'
import { layersType as LayersType } from '../../domain/entities/layers'
import Tag from 'rsuite/lib/Tag'
import { COLORS } from '../../constants/constants'
import { ReactComponent as BoxFilterSVG } from '../icons/Filtre_zone_rectangle.svg'
import { ReactComponent as CloseIconSVG } from '../icons/Croix_grise.svg'
import { ReactComponent as PolygonFilterSVG } from '../icons/Filtre_zone_polygone.svg'
import Countries from 'i18n-iso-countries'

const VesselListFilters = ({ lastPositionTimeAgo, countries, fleetSegments, gears, zones, geometrySelection }) => {
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

  const showZonesSelected = useCallback(() => {
    return zones.zonesSelected && zones.zonesSelected.length && zones.zonesSelected.find(zone => zone.code === LayersType.FREE_DRAW)
      ? zones.zonesSelected.filter(zone => zone.code === LayersType.FREE_DRAW).map((zoneSelected, index) => {
        return <ZoneSelected key={zoneSelected.code + index}>
          <DeleteZoneText>Effacer la zone définie</DeleteZoneText>
          <CloseIcon onClick={() => zones.callRemoveZoneSelected(zoneSelected)}/>
        </ZoneSelected>
      })
      : null
  }, [zones.zonesSelected])

  function renderMenuItem (item) {
    return (
      <Label>
        {item.label}
      </Label>
    )
  }

  function renderValue (items) {
    return items.map((tag, index) => (
      <Tag key={index}>
        {tag.label}
      </Tag>
    ))
  }

  return (
    <Filters>
      <FilterDesc>
        Dernières positions depuis {' '}
      </FilterDesc>
      <TimeAgoSelect>
        <SelectPicker
          style={{ width: 70 }}
          searchable={false}
          placeholder="x heures..."
          value={lastPositionTimeAgo.lastPositionTimeAgoFilter}
          onChange={lastPositionTimeAgo.setLastPositionTimeAgoFilter}
          data={getLastPositionTimeAgoLabels()}
        />
      </TimeAgoSelect>
      <TagPicker
        value={countries.countriesFiltered}
        style={{ width: 180, margin: '2px 10px 0 20px', verticalAlign: 'top' }}
        data={countriesField}
        placeholder="Nationalité"
        onChange={change => countries.setCountriesFiltered(change)}
        renderMenuItem={(_, item) => renderMenuItem(item)}
        renderValue={(_, items) => renderValue(items)}
      />
      <TagPicker
        value={fleetSegments.fleetSegmentsFiltered}
        style={{ width: 180, margin: '2px 10px 0 20px', verticalAlign: 'top' }}
        data={fleetSegmentsField}
        placeholder="Segments de flotte"
        onChange={change => fleetSegments.setFleetSegmentsFiltered(change)}
        renderMenuItem={(_, item) => renderMenuItem(item)}
        renderValue={(_, items) => renderValue(items)}
      />
      <TagPicker
        value={gears.gearsFiltered}
        style={{ width: 180, margin: '2px 10px 0 20px', verticalAlign: 'top' }}
        data={gearsField}
        placeholder="Engins à bord"
        onChange={change => gears.setGearsFiltered(change)}
        renderMenuItem={(_, item) => renderMenuItem(item)}
        renderValue={(_, items) => renderValue(items)}
      />
      <ZoneFilter>
        <MultiCascader
          data={zones.zonesFilter}
          style={{ width: 230, verticalAlign: 'top', margin: '2px 10px 0 10px' }}
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
      </ZoneFilter>
    </Filters>
  )
}

const DeleteZoneText = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
`
const CustomZone = styled.span`
  margin-left: 50px;
`

const ZoneSelected = styled.span`
  background: ${COLORS.grayBackground};
  border-radius: 2px;
  color: ${COLORS.textGray};
  margin-left: 0;
  font-size: 13px;
  padding: 0px 3px 0px 7px;
  vertical-align: top;
  height: 30px;
  display: inline-block;
`

const ZoneFilter = styled.div`
  display: inline-block;
  margin-right: 20px;
  margin-left: 10px;
  font-size: 13px;
  vertical-align: sub;
`

const TimeAgoSelect = styled.div`
  width: 120px;
  display: inline-block;
  margin-right: 20px;
  margin-left: 10px;
`

const Label = styled.span`
  font-size: 13px;
`

const FilterDesc = styled.span`
  font-size: 13px;
  margin-top: 7px;
  display: inline-block;
  vertical-align: sub;
`

const Filters = styled.div`
  color: #969696;
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

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding-left: 7px;
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
