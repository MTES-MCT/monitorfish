import { Backoffice } from '@features/BackOffice'
import { EditRegulation } from '@features/BackOffice/edit_regulation/EditRegulation'
import { ControlObjectiveTable } from '@features/ControlObjective/components/ControlObjectiveTable'
import { FleetSegmentsBackoffice } from '@features/FleetSegment/components/FleetSegmentsBackoffice'
import { BackofficePage } from '@pages/BackofficePage'
import { createBrowserRouter } from 'react-router-dom'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const routes = [
  {
    path: '/backoffice',
    element: <BackofficePage />,
    children: [
      {
        index: true,
        element: <Backoffice />
      },
      {
        path: 'regulation',
        element: <Backoffice />
      },
      {
        path: 'regulation/new',
        element: <EditRegulation isEdition={false} title="Saisir une nouvelle réglementation" />
      },
      {
        path: 'regulation/edit',
        element: <EditRegulation isEdition title="Modifier la réglementation de la zone" />
      },
      {
        path: 'control_objectives',
        element: <ControlObjectiveTable />
      },
      {
        path: 'fleet_segments',
        element: <FleetSegmentsBackoffice />
      }
    ]
  }
]
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const routesPaths = routes.map(route => route.path)

export const router = createBrowserRouter(routes)
