import { getExpandableRowCellCustomStyle } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList/cells/utils'
import {
  AdministrativeAreaType,
  AdministrativeAreaTypeLabel,
  AdministrativeAreaValueLabel
} from '@features/Alert/constants'
import { type AlertSpecification } from '@features/Alert/types'
import { Flag } from '@features/commonComponents/Flag'
import { useGetGearsAsOptions } from '@hooks/useGetGearsAsOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, type Row as RowType } from '@tanstack/react-table'
import countries from 'i18n-iso-countries'
import styled from 'styled-components'

type RowProps = Readonly<{
  row: RowType<AlertSpecification>
}>
export function Row({ row }: RowProps) {
  const { gearsAsOptions } = useGetGearsAsOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const alertSpecification = row.original
  const baseUrl = window.location.origin

  return (
    <>
      <StyledTr $isInError={alertSpecification.isInError} data-id={row.id}>
        {row?.getVisibleCells().map(cell => (
          <ExpandableRowCell
            key={cell.id}
            $hasRightBorder={['validityPeriod'].includes(cell.column.id)}
            onClick={() => row.toggleExpanded()}
            style={getExpandableRowCellCustomStyle(cell.column)}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </ExpandableRowCell>
        ))}
      </StyledTr>

      {row.getIsExpanded() && (
        <ExpandedRow data-id={`${row.id}-expanded`}>
          <ExpandedRowCell />
          <ExpandedRowCell>
            <p>
              <ExpandedRowLabel>Description</ExpandedRowLabel>
              <ExpandedRowValue>{alertSpecification.description}</ExpandedRowValue>
            </p>
            {!!alertSpecification.id && (
              <p>
                <ExpandedRowLabel>Position VMS pris en compte</ExpandedRowLabel>
                <ExpandedRowValue>
                  {!!alertSpecification.id &&
                    alertSpecification.onlyFishingPositions &&
                    'Les positions en pêche uniquement'}
                  {!!alertSpecification.id && !alertSpecification.onlyFishingPositions && 'Toutes les positions en mer'}
                </ExpandedRowValue>
              </p>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            {alertSpecification.gears.length > 0 && (
              <p>
                <ExpandedRowLabel>Engins à bord :</ExpandedRowLabel>
                <ExpandedRowValue>
                  {alertSpecification.gears
                    .map(gear => {
                      const gearName = gearsAsOptions?.find(gearOption => gearOption.value === gear.gear)

                      const meshText = gear.minMesh ? `maillage min. ${gear.minMesh}mm` : null

                      return `${gearName?.label ?? gear.gear}${meshText ? ` (${meshText})` : ''}`
                    })
                    .join(', ')}
                </ExpandedRowValue>
              </p>
            )}
            {alertSpecification.species.length > 0 && (
              <p>
                <ExpandedRowLabel>Espèces à bord :</ExpandedRowLabel>
                <ExpandedRowValue>
                  {alertSpecification.species
                    .map(species => {
                      const speciesName = speciesAsOptions?.find(
                        speciesOption => speciesOption.value.code === species.species
                      )

                      return `${speciesName?.label ?? species.species}${species.minWeight !== undefined ? ` (supérieure à ${species.minWeight}kg)` : ''}`
                    })
                    .join(', ')}
                </ExpandedRowValue>
              </p>
            )}
            {alertSpecification.speciesCatchAreas.length > 0 && (
              <p>
                <ExpandedRowLabel>Zones de capture (FAR) :</ExpandedRowLabel>
                <ExpandedRowValue>
                  {alertSpecification.speciesCatchAreas.join(', ').replaceAll('fao_areas.', '')}
                </ExpandedRowValue>
              </p>
            )}

            {alertSpecification.flagStatesIso2.length > 0 && (
              <p>
                <ExpandedRowLabel>Nationalités :</ExpandedRowLabel>
                <ExpandedRowValue>
                  {alertSpecification.flagStatesIso2
                    .map(flagState => countries.getName(flagState.toLowerCase(), 'fr'))
                    .join(', ')}
                </ExpandedRowValue>
              </p>
            )}
            {alertSpecification.districtCodes.length > 0 && (
              <p>
                <ExpandedRowLabel>Quartiers :</ExpandedRowLabel>
                <ExpandedRowValue>{alertSpecification.districtCodes.join(', ')}</ExpandedRowValue>
              </p>
            )}
            {alertSpecification.producerOrganizations.length > 0 && (
              <p>
                <ExpandedRowLabel>OPs :</ExpandedRowLabel>
                <ExpandedRowValue>{alertSpecification.producerOrganizations.join(', ')}</ExpandedRowValue>
              </p>
            )}
            {alertSpecification.vesselIds.length > 0 && (
              <p>
                <ExpandedRowLabel>Navires :</ExpandedRowLabel>
                <ExpandedRowValue>
                  {alertSpecification.vessels?.map(vessel => (
                    <span title={vessel.internalReferenceNumber}>
                      <Flag
                        rel="preload"
                        src={`${baseUrl ? `${baseUrl}/` : ''}flags/${vessel.flagState.toLowerCase()}.svg`}
                        style={{ marginLeft: 5, marginRight: 5, marginTop: -1, width: 13 }}
                        title={countries.getName(vessel.flagState.toLowerCase(), 'fr')}
                      />
                      {vessel.vesselName},
                    </span>
                  ))}
                </ExpandedRowValue>
              </p>
            )}
            {(alertSpecification.administrativeAreas?.length > 0 || alertSpecification.regulatoryAreas?.length > 0) && (
              <p>
                <ExpandedRowLabel>Zones (VMS) :</ExpandedRowLabel>
                <ExpandedRowValue>
                  {alertSpecification.administrativeAreas.map(area => {
                    const areas =
                      area.areaType === AdministrativeAreaType.DISTANCE_TO_SHORE
                        ? area.areas.map(areaValue => AdministrativeAreaValueLabel[areaValue] ?? areaValue)
                        : area.areas

                    return (
                      <>
                        {AdministrativeAreaTypeLabel[area.areaType]}: {areas.join(', ')}
                        <br />
                      </>
                    )
                  })}
                  {alertSpecification.regulatoryAreas.map(area => (
                    <>
                      Zone REG &quot;{area.topic ?? 'Aucun topic'} - {area.zone ?? 'Aucun nom'}&quot;
                      <br />
                    </>
                  ))}
                </ExpandedRowValue>
              </p>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <p>
              <ExpandedRowLabel>Délai de visibilité</ExpandedRowLabel>
              <ExpandedRowValue>{alertSpecification.trackAnalysisDepth} heures</ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Fréquence d&apos;actualisation</ExpandedRowLabel>
              <ExpandedRowValue>10 minutes</ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Archivage auto des signalements</ExpandedRowLabel>
              <ExpandedRowValue>
                {alertSpecification.hasAutomaticArchiving ? 'Oui, quand le navire fait un nouveau DEP.' : 'Non'}
              </ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell />
        </ExpandedRow>
      )}
    </>
  )
}

const StyledTr = styled(TableWithSelectableRows.BodyTr)<{
  $isInError: boolean
}>`
  > td {
    background-color: ${p => (p.$isInError ? p.theme.color.maximumRed15 : p.theme.color.cultured)};
  }
`

const ExpandableRowCell = styled(TableWithSelectableRows.Td)`
  cursor: pointer;
  user-select: none;
  color: ${p => p.theme.color.charcoal};
  background: ${p => p.theme.color.cultured};
`

// TODO Add this feature in monitor-ui.
const ExpandedRow = styled(TableWithSelectableRows.BodyTr)`
  > td {
    overflow: hidden !important;
    color: ${p => p.theme.color.charcoal};
    background: ${p => p.theme.color.cultured};
  }

  &:hover {
    > td {
      /* Hack to disable hover background color in expanded rows */
      background-color: ${p => p.theme.color.cultured};
    }
  }
`

const ExpandedRowCell = styled(TableWithSelectableRows.Td).attrs(props => ({
  ...props,
  $hasRightBorder: false
}))`
  padding: 8px 16px 16px;
  height: 42px;
  vertical-align: top;
  white-space: normal;

  > p:not(:first-child) {
    margin-top: 16px;
  }
`

const ExpandedRowLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: block;
  font-weight: 400;
  width: 100%;
`
const ExpandedRowValue = styled.span<{
  $isLight?: boolean
}>`
  color: ${p => (p.$isLight ? p.theme.color.slateGray : 'inherit')};
  display: block;
`
