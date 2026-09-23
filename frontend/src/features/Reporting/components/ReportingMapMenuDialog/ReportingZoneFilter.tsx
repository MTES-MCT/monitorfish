import { fitMapToExtent } from '@features/Map/useCases/animateMap'
import { useReportingsFilters } from '@features/Reporting/hooks/useReportingsFilters'
import { MultiLocationEditor, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { WKT } from 'ol/format'
import { transformExtent } from 'ol/proj'
import { useMemo } from 'react'
import styled from 'styled-components'

import type { Geometry } from 'ol/geom'

const wktFormat = new WKT()
// `MultiLocationEditor` resets its state whenever `defaultValue` isn't deeply equal to the first one it got,
// so it must get a stable reference, or it re-renders forever
const NO_LOCATIONS: Record<string, any>[] = []

type ReportingZoneFilterProps = Readonly<{
  className?: string
}>
/**
 * Lets the user restrict reportings to a zone drawn on the map, on both the map menu and the
 * reporting list. The drawn geometry is committed to the shared filters by `useReportingsFilters`.
 */
export function ReportingZoneFilter({ className }: ReportingZoneFilterProps) {
  const { drawZone, filters, updateZone } = useReportingsFilters()

  const locations = useMemo(
    () =>
      filters.zone
        ? [{ geometry: wktFormat.readGeometry(filters.zone), reportingZone: 'Polygone dessiné' }]
        : NO_LOCATIONS,
    [filters.zone]
  )

  const handleChange = () => {
    drawZone()
  }

  const handleCenter = (zone: Record<string, any>) => {
    const extent = (zone.geometry as Geometry).getExtent()

    fitMapToExtent(transformExtent(extent, WSG84_PROJECTION, OPENLAYERS_PROJECTION))
  }

  return (
    <Wrapper className={className}>
      <MultiLocationEditor
        defaultValue={locations}
        isLabelHidden
        isRequired
        label="Filtrer avec une zone dessinée sur la carte"
        labelPropName="reportingZone"
        onCenter={handleCenter}
        onDelete={() => updateZone(undefined)}
        zoneOptions={{
          buttonLabel: 'Définir une zone de filtre manuelle',
          initialValue: {
            name: 'Polygone dessiné'
          },
          isButtonDisabled: !!filters.zone,
          onAdd: handleChange
        }}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-bottom: 24px;
`
