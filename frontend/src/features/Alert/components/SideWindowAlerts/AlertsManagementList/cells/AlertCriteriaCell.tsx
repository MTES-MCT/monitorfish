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
import countries from 'i18n-iso-countries'
import styled from 'styled-components'

type AlertCriteriaCellProps = Readonly<{
  alertSpecification: AlertSpecification
}>

export function AlertCriteriaCell({ alertSpecification }: AlertCriteriaCellProps) {
  const { gearsAsOptions } = useGetGearsAsOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const baseUrl = window.location.origin

  return (
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
  )
}

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
