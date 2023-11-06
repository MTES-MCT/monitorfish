import { createBrowserRouter, Navigate } from 'react-router-dom'

import { Backoffice } from './features/Backoffice'
import { EditRegulation } from './features/Backoffice/edit_regulation/EditRegulation'
import { FleetSegments } from './features/Backoffice/fleet_segments/FleetSegments'
import { ControlObjectiveTable } from './features/ControlObjective/components/ControlObjectiveTable'
import { MainWindow } from './features/MainWindow'
import { SideWindow } from './features/SideWindow'
import { BackofficePage } from './pages/BackofficePage'
import { HomePage } from './pages/HomePage'
import { LightBackoffice } from './pages/LightBackoffice'
import { LightHomePage } from './pages/LightHomePage'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const routes = [
  {
    path: '/',
    element: <HomePage />,
    children: [
      {
        index: true,
        element: <MainWindow />
      }
    ]
  },
  {
    path: '/light',
    element: <LightHomePage />,
    children: [
      {
        index: true,
        element: <MainWindow />
      }
    ]
  },
  {
    path: '/load_light',
    element: <LightBackoffice />
  },
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
        element: <FleetSegments />
      }
    ]
  },
  {
    path: '/ext',
    element: <Navigate replace to="/" />
  },
  {
    path: '/side_window',
    element: <HomePage />,
    children: [
      {
        index: true,
        element: <SideWindow isFromURL />
      }
    ]
  }
]
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const routesPaths = routes.map(route => route.path)

export const router = createBrowserRouter(routes)
