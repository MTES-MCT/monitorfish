import { Ellipsised } from '@components/Ellipsised'
import { Titled } from '@components/Titled'
import { HiddenText } from '@features/commonStyles/HiddenText'
import { FLEET_SEGMENT_ORIGIN_LABEL, GEAR_ORIGIN_LABEL } from '@features/FleetSegment/constants'
import { DataKind, type IsDataAvailable } from '@features/PositionReplay/replayableData'
import { isReplayedVessel } from '@features/PositionReplay/replayedVessel'
import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { getLastControlDateTimeAndControlType } from '@features/Vessel/components/VesselList/utils'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs, TableWithSelectableRows, Tag, THEME } from '@mtes-mct/monitor-ui'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import styled from 'styled-components'

import { ActionButtonsCell } from './cells/ActionButtonsCell'
import { None, StyledCountryFlag } from './styles'
import { VesselRiskFactor } from '../../../RiskFactor/components/VesselRiskFactor'

import type { VesselListFilter } from '@features/Vessel/components/VesselList/types'
import type { DynamicVesselGroupFilter } from '@features/VesselGroup/types'
import type { CellContext, ColumnDef } from '@tanstack/react-table'

/** The data displayed by a column: the column is kept but emptied when this data is unavailable. */
const COLUMN_DATA_KIND: Partial<Record<string, DataKind>> = {
  gears: DataKind.GEARS_ONBOARD,
  hasInfractionSuspicion: DataKind.INFRACTION_SUSPICIONS,
  lastControlDateTime: DataKind.CONTROLS,
  riskFactor: DataKind.RISK_FACTOR,
  segments: DataKind.FLEET_SEGMENTS,
  species: DataKind.SPECIES_ONBOARD
}

function getActiveVessel(vessel: Vessel.DisplayedVessel): Vessel.ActiveVessel | undefined {
  return isReplayedVessel(vessel) ? undefined : vessel
}

export function getTableColumns<T extends Vessel.DisplayedVessel>(
  isFromUrl: boolean,
  actionColumn: ColumnDef<T, any>,
  listFilter: VesselListFilter | DynamicVesselGroupFilter | undefined,
  isDataAvailable: IsDataAvailable
): Array<ColumnDef<T, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0
  const actionColumnWithOffset = { ...actionColumn, size: (actionColumn.size ?? 60) + legacyFirefoxOffset }

  const columns: Array<ColumnDef<T, any>> = [
    {
      accessorFn: row => row.vesselFeatureId,
      cell: ({ getValue, row }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        >
          <HiddenText>{`Sélectionner le navire ${getValue()}`}</HiddenText>
        </TableWithSelectableRows.RowCheckbox>
      ),
      enableSorting: false,
      header: ({ table }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        >
          <HiddenText>Sélectionner tous les navires</HiddenText>
        </TableWithSelectableRows.RowCheckbox>
      ),
      id: 'select',
      size: 25 + legacyFirefoxOffset
    },
    {
      accessorFn: row => getActiveVessel(row)?.riskFactor,
      cell: (info: CellContext<T, number | undefined>) => (
        <VesselRiskFactor isVesselUnderCharter={info.row.original.underCharter} vesselRiskFactor={info.getValue()} />
      ),
      enableSorting: true,
      header: () => 'Ndr',
      id: 'riskFactor',
      size: 65 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.vesselName ?? (row.vesselId === -1 ? 'Navire inconnu' : '-'),
      cell: (info: CellContext<T, string>) => {
        const vessel = info.row.original

        return (
          <Ellipsised>
            <StyledCountryFlag countryCode={vessel.flagState} size={[20, 14]} />
            <Titled>{info.getValue()}</Titled>
          </Ellipsised>
        )
      },
      enableSorting: true,
      header: () => 'Navire',
      id: 'vesselName',
      size: 244 + legacyFirefoxOffset
    },
    {
      accessorFn: row => {
        const segments = getActiveVessel(row)?.segments ?? []

        return segments.length > 0 ? segments.join(', ') : undefined
      },
      cell: (info: CellContext<T, string | undefined>) => {
        const activityOrigin = getActiveVessel(info.row.original)?.activityOrigin

        return info.getValue() ? (
          <>
            {activityOrigin === ActivityOrigin.FROM_LOGBOOK && (
              <Tag backgroundColor={THEME.color.mediumSeaGreen25} color={THEME.color.charcoal}>
                <Ellipsised maxWidth={120} title={FLEET_SEGMENT_ORIGIN_LABEL[activityOrigin]}>
                  {info.getValue()}
                </Ellipsised>
              </Tag>
            )}
            {activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE && (
              <Tag backgroundColor={THEME.color.white} color={THEME.color.charcoal}>
                <Ellipsised maxWidth={120} title={FLEET_SEGMENT_ORIGIN_LABEL[activityOrigin]}>
                  <i>{info.getValue()}</i>
                </Ellipsised>
              </Tag>
            )}
          </>
        ) : (
          <None>Aucun segment</None>
        )
      },
      enableSorting: true,
      header: () => 'Segments',
      id: 'segments',
      size: 178 + legacyFirefoxOffset
    },
    {
      accessorFn: row => {
        const gears = getActiveVessel(row)?.gearsArray ?? []

        return gears.length > 0 ? gears.join(', ') : undefined
      },
      cell: (info: CellContext<T, string | undefined>) => {
        const activityOrigin = getActiveVessel(info.row.original)?.activityOrigin

        return info.getValue() ? (
          <Ellipsised>
            {activityOrigin === ActivityOrigin.FROM_LOGBOOK && (
              <Tag
                backgroundColor={THEME.color.mediumSeaGreen25}
                color={THEME.color.charcoal}
                title={GEAR_ORIGIN_LABEL[activityOrigin]}
              >
                {info.getValue()}
              </Tag>
            )}
            {activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE && (
              <Tag
                backgroundColor={THEME.color.white}
                color={THEME.color.charcoal}
                title={GEAR_ORIGIN_LABEL[activityOrigin]}
              >
                <i>{info.getValue()}</i>
              </Tag>
            )}
          </Ellipsised>
        ) : (
          <None>Aucun engin</None>
        )
      },
      enableSorting: false,
      header: () => 'Engins',
      id: 'gears',
      size: 204 + legacyFirefoxOffset
    },
    {
      accessorFn: row => {
        const species = getActiveVessel(row)?.speciesArray ?? []

        return species.length > 0 ? species.join(', ') : undefined
      },
      cell: (info: CellContext<T, string | undefined>) =>
        info.getValue() ? <Ellipsised>{info.getValue()}</Ellipsised> : <None>Le navire n&apos;a pas fait de FAR</None>,
      enableSorting: false,
      header: () => 'Espèces',
      id: 'species',
      size: 274 + legacyFirefoxOffset
    },
    {
      accessorFn: row => getActiveVessel(row)?.lastControlAtSeaDateTime,
      cell: (info: CellContext<T, string | undefined>) => {
        const vessel = getActiveVessel(info.row.original)
        const hasLastControlAtSeaFilter =
          listFilter?.lastControlAtSeaPeriod !== DEFAULT_VESSEL_LIST_FILTER_VALUES.lastControlAtSeaPeriod
        const hasLastControlAtQuayFilter =
          listFilter?.lastControlAtQuayPeriod !== DEFAULT_VESSEL_LIST_FILTER_VALUES.lastControlAtQuayPeriod
        const { controlType, lastControlDateTime } = getLastControlDateTimeAndControlType(
          hasLastControlAtSeaFilter,
          hasLastControlAtQuayFilter,
          vessel
        )

        return lastControlDateTime ? (
          <>
            {customDayjs(lastControlDateTime).utc().format('[Le] DD/MM/YYYY')}{' '}
            <LastControlType>{controlType}</LastControlType>
          </>
        ) : (
          <None>Aucun depuis 5 ans</None>
        )
      },
      enableSorting: true,
      header: () => 'Dernier contrôle',
      id: 'lastControlDateTime',
      size: 204 + legacyFirefoxOffset
    },
    {
      accessorFn: row => getActiveVessel(row)?.hasInfractionSuspicion,
      cell: (info: CellContext<T, boolean | undefined>) =>
        info.getValue() ? (
          <Tag backgroundColor={THEME.color.maximumRed15} color={THEME.color.maximumRed}>
            Signalement(s)
          </Tag>
        ) : (
          ''
        ),
      enableSorting: true,
      header: () => 'Signalements',
      id: 'hasInfractionSuspicion',
      size: 184 + legacyFirefoxOffset
    },
    actionColumnWithOffset
  ]

  return columns.map(column => {
    const dataKind = column.id ? COLUMN_DATA_KIND[column.id] : undefined
    if (!dataKind || isDataAvailable(dataKind)) {
      return column
    }

    return { ...column, cell: () => '', enableSorting: false }
  })
}

export const vesselListActionColumn: ColumnDef<Vessel.DisplayedVessel, any> = {
  accessorFn: row => row.vesselFeatureId,
  cell: (info: CellContext<Vessel.DisplayedVessel, string>) => <ActionButtonsCell vessel={info.row.original} />,
  enableSorting: false,
  header: () => '',
  id: 'actions',
  size: 60
}

const LastControlType = styled.span`
  color: ${p => p.theme.color.slateGray};
`
