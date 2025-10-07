import { Ellipsised } from '@components/Ellipsised'
import { Titled } from '@components/Titled'
import { FLEET_SEGMENT_ORIGIN_LABEL, GEAR_ORIGIN_LABEL } from '@features/FleetSegment/constants'
import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { getLastControlDateTimeAndControlType } from '@features/Vessel/components/VesselList/utils'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { getLastControlDateTime } from '@features/Vessel/utils'
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

export function getTableColumns(
  isFromUrl: boolean,
  actionColumn: ColumnDef<Vessel.ActiveVessel, any>,
  listFilter: VesselListFilter | DynamicVesselGroupFilter | undefined
): Array<ColumnDef<Vessel.ActiveVessel, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0
  const actionColumnWithOffset = { ...actionColumn, size: (actionColumn.size ?? 60) + legacyFirefoxOffset }

  return [
    {
      accessorFn: row => row.vesselFeatureId,
      cell: ({ row }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      header: ({ table }) => (
        <TableWithSelectableRows.RowCheckbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      id: 'select',
      size: 25 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.riskFactor,
      cell: (info: CellContext<Vessel.ActiveVessel, number | undefined>) => {
        const vessel = info.row.original

        const lastControlDateTime = getLastControlDateTime(
          vessel.lastControlAtSeaDateTime,
          vessel.lastControlAtQuayDateTime
        )

        return (
          <VesselRiskFactor
            hasVesselRiskFactorSegments={false}
            isVesselUnderCharter={vessel.underCharter}
            vesselLastControlDateTime={lastControlDateTime}
            vesselRiskFactor={vessel.riskFactor}
          />
        )
      },
      enableSorting: true,
      header: () => 'Ndr',
      id: 'riskFactor',
      size: 65 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.vesselName ?? (row.vesselId === -1 ? 'Navire inconnu' : '-'),
      cell: (info: CellContext<Vessel.ActiveVessel, string>) => {
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
        if (row.segments.length > 0) {
          return row.segments.map(tripSegment => tripSegment).join(', ')
        }

        return undefined
      },
      cell: (info: CellContext<Vessel.ActiveVessel, string | undefined>) =>
        info.getValue() ? (
          <Ellipsised>
            {info.row.original.activityOrigin === ActivityOrigin.FROM_LOGBOOK && (
              <Tag
                backgroundColor={THEME.color.mediumSeaGreen25}
                color={THEME.color.charcoal}
                title={FLEET_SEGMENT_ORIGIN_LABEL[info.row.original.activityOrigin]}
              >
                {info.getValue()}
              </Tag>
            )}
            {info.row.original.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE && (
              <Tag
                backgroundColor={THEME.color.white}
                color={THEME.color.charcoal}
                title={FLEET_SEGMENT_ORIGIN_LABEL[info.row.original.activityOrigin]}
              >
                <i>{info.getValue()}</i>
              </Tag>
            )}
          </Ellipsised>
        ) : (
          <None>Aucun segment</None>
        ),
      enableSorting: true,
      header: () => 'Segments',
      id: 'segments',
      size: 178 + legacyFirefoxOffset
    },
    {
      accessorFn: row => {
        if (row.gearsArray.length) {
          return row.gearsArray.join(', ')
        }

        return undefined
      },
      cell: (info: CellContext<Vessel.ActiveVessel, string | undefined>) =>
        info.getValue() ? (
          <Ellipsised>
            {info.row.original.activityOrigin === ActivityOrigin.FROM_LOGBOOK && (
              <Tag
                backgroundColor={THEME.color.mediumSeaGreen25}
                color={THEME.color.charcoal}
                title={GEAR_ORIGIN_LABEL[info.row.original.activityOrigin]}
              >
                {info.getValue()}
              </Tag>
            )}
            {info.row.original.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE && (
              <Tag
                backgroundColor={THEME.color.white}
                color={THEME.color.charcoal}
                title={GEAR_ORIGIN_LABEL[info.row.original.activityOrigin]}
              >
                <i>{info.getValue()}</i>
              </Tag>
            )}
          </Ellipsised>
        ) : (
          <None>Aucun engin</None>
        ),
      enableSorting: false,
      header: () => 'Engins',
      id: 'gears',
      size: 204 + legacyFirefoxOffset
    },
    {
      accessorFn: row => (row.speciesArray.length > 0 ? row.speciesArray.join(', ') : undefined),
      cell: (info: CellContext<Vessel.ActiveVessel, string | undefined>) =>
        info.getValue() ? <Ellipsised>{info.getValue()}</Ellipsised> : <None>Le navire n&apos;a pas fait de FAR</None>,
      enableSorting: false,
      header: () => 'Espèces',
      id: 'species',
      size: 274 + legacyFirefoxOffset
    },
    {
      accessorKey: 'lastControlAtSeaDateTime',
      cell: (info: CellContext<Vessel.ActiveVessel, string | undefined>) => {
        const vessel = info.row.original
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
      accessorKey: 'hasInfractionSuspicion',
      cell: (info: CellContext<Vessel.ActiveVessel, boolean>) =>
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
}

export const vesselListActionColumn: ColumnDef<Vessel.ActiveVessel, any> = {
  accessorFn: row => row.vesselFeatureId,
  cell: (info: CellContext<Vessel.ActiveVessel, string>) => <ActionButtonsCell vessel={info.row.original} />,
  enableSorting: false,
  header: () => '',
  id: 'actions',
  size: 60
}

const LastControlType = styled.span`
  color: ${p => p.theme.color.slateGray};
`
