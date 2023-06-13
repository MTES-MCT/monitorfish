import { createBrowserRouter, Navigate } from 'react-router-dom'

import { Backoffice } from './features/Backoffice'
import { ControlObjectiveList } from './features/Backoffice/ControlObjectiveList'
import { EditRegulation } from './features/Backoffice/edit_regulation/EditRegulation'
import { FleetSegments } from './features/Backoffice/fleet_segments/FleetSegments'
import { MainWindow } from './features/MainWindow'
import { SideWindow } from './features/SideWindow'
import { BackofficePage } from './pages/BackofficePage'
import { HomePage } from './pages/HomePage'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const router = createBrowserRouter([
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
        element: <ControlObjectiveList />
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
])
/* eslint-enable sort-keys-fix/sort-keys-fix */
