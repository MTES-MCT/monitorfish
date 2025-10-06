import { Ellipsised } from '@components/Ellipsised'
import { getAlertCriteriaSummary } from '@features/Alert/components/SideWindowAlerts/AlertsManagement/cells/utils'
import { Icon, Tag, THEME } from '@mtes-mct/monitor-ui'
import { isLegacyFirefox } from '@utils/isLegacyFirefox'
import { Toggle } from 'rsuite'
import styled from 'styled-components'

import { ActionButtonsCell } from './cells/ActionButtonsCell'
import { getDate } from '../../../../../utils'

import type { AlertSpecification } from '@features/Alert/types'
import type { CellContext, ColumnDef } from '@tanstack/react-table'

export function getTableColumns(isFromUrl: boolean): Array<ColumnDef<AlertSpecification, any>> {
  const legacyFirefoxOffset = !isFromUrl && isLegacyFirefox() ? -32 : 0

  return [
    {
      accessorFn: row => `${row.type}:${row.id}`,
      cell: ({ row }) => {
        const alertSpecification = row.original

        return <Toggle checked={alertSpecification.isActivated} disabled size="sm" />
      },
      enableSorting: false,
      header: () => '',
      id: 'isActivated',
      size: 40 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.name,
      cell: (info: CellContext<AlertSpecification, string>) => <Ellipsised>{info.getValue()}</Ellipsised>,
      enableSorting: true,
      header: () => 'Nom',
      id: 'name',
      size: 300 + legacyFirefoxOffset
    },
    {
      accessorFn: row => `${row.type}:${row.id}`,
      cell: ({ row }) => {
        const alertSpecification = row.original

        return <Ellipsised>{getAlertCriteriaSummary(alertSpecification)}</Ellipsised>
      },
      enableSorting: true,
      header: () => 'Critères de déclenchement',
      id: 'criterias',
      size: 500 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.natinfCode,
      enableSorting: true,
      header: () => 'NATINF',
      id: 'natinfCode',
      size: 100 + legacyFirefoxOffset
    },
    {
      accessorFn: row => row.validityEndDatetimeUtc,
      cell: ({ row }) => {
        const alertSpecification = row.original

        if (!alertSpecification.validityEndDatetimeUtc && !alertSpecification.validityStartDatetimeUtc) {
          return (
            <StyledTag backgroundColor={THEME.color.mediumSeaGreen25} color={THEME.color.gunMetal}>
              En tous temps
            </StyledTag>
          )
        }

        return (
          <ValidityPeriod>
            <Tag backgroundColor={THEME.color.goldenPoppy25} color={THEME.color.gunMetal}>
              Du {getDate(alertSpecification.validityStartDatetimeUtc).replace('/20', '/')} au{' '}
              {getDate(alertSpecification.validityEndDatetimeUtc).replace('/20', '/')}
            </Tag>
            {alertSpecification.repeatEachYear && <Icon.Calendar />}
          </ValidityPeriod>
        )
      },
      enableSorting: true,
      header: () => 'Période de validité',
      id: 'validityPeriod',
      size: 220 + legacyFirefoxOffset
    },
    {
      accessorFn: row => `${row.type}:${row.id}`,
      cell: (info: CellContext<AlertSpecification, string>) => (
        <ActionButtonsCell alertSpecification={info.row.original} />
      ),
      enableSorting: false,
      header: () => '',
      id: 'actions',
      size: 80 + legacyFirefoxOffset
    }
  ]
}

const StyledTag = styled(Tag)`
  font-style: italic;
  vertical-align: middle;
`

const ValidityPeriod = styled.span`
  * {
    vertical-align: middle;
  }

  .Element-IconBox {
    margin-left: 4px;
  }
`
