import { Backoffice } from '@features/BackOffice'
import { EditRegulation } from '@features/BackOffice/edit_regulation/EditRegulation'
import { ControlObjectiveTable } from '@features/ControlObjective/components/ControlObjectiveTable'
import { FleetSegmentsBackoffice } from '@features/FleetSegment/components/FleetSegmentsBackoffice'
import { MainWindow } from '@features/MainWindow'
import { PriorNotificationSubscriberTable } from '@features/PriorNotification/components/PriorNotificationSubscriberTable'
import { SideWindow } from '@features/SideWindow'
import { BackofficePage } from '@pages/BackofficePage'
import { HomePage } from '@pages/HomePage'
import { LightBackoffice } from '@pages/LightBackoffice'
import { LightHomePage } from '@pages/LightHomePage'
import { LoginPage } from '@pages/LoginPage'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { Login } from './auth/components/Login'
import { Register } from './auth/components/Register'
import { RequireAuth } from './auth/components/RequireAuth'
import { paths } from './paths'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const routes = [
  {
    path: paths.home,
    element: <HomePage />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth redirect>
            <MainWindow />
          </RequireAuth>
        )
      }
    ]
  },
  {
    path: paths.light,
    element: <LightHomePage />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth redirect>
            <MainWindow />
          </RequireAuth>
        )
      }
    ]
  },
  {
    path: paths.login,
    element: <LoginPage />,
    children: [
      {
        index: true,
        element: <Login />
      }
    ]
  },
  {
    path: paths.register,
    element: <Register />
  },
  {
    path: paths.loadLight,
    element: <LightBackoffice />
  },
  {
    path: paths.backoffice,
    element: <BackofficePage />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth redirect requireSuperUser>
            <Backoffice />
          </RequireAuth>
        )
      },
      {
        path: paths.regulation,
        element: (
          <RequireAuth redirect requireSuperUser>
            <Backoffice />
          </RequireAuth>
        )
      },
      {
        path: paths.newRegulation,
        element: (
          <RequireAuth redirect requireSuperUser>
            <EditRegulation isEdition={false} title="Saisir une nouvelle réglementation" />
          </RequireAuth>
        )
      },
      {
        path: paths.editRegulation,
        element: (
          <RequireAuth redirect requireSuperUser>
            <EditRegulation isEdition title="Modifier la réglementation de la zone" />
          </RequireAuth>
        )
      },
      {
        path: paths.controlObjectives,
        element: (
          <RequireAuth redirect requireSuperUser>
            <ControlObjectiveTable />
          </RequireAuth>
        )
      },
      {
        path: paths.fleetSegments,
        element: (
          <RequireAuth redirect requireSuperUser>
            <FleetSegmentsBackoffice />
          </RequireAuth>
        )
      },
      {
        path: paths.controlUnitSubscribers,
        element: (
          <RequireAuth redirect requireSuperUser>
            <PriorNotificationSubscriberTable />
          </RequireAuth>
        )
      }
    ]
  },
  {
    path: paths.ext,
    element: <Navigate replace to="/" />
  },
  {
    path: paths.sideWindow,
    element: <HomePage />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth redirect>
            <SideWindow isFromURL />
          </RequireAuth>
        )
      }
    ]
  }
]
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const router = createBrowserRouter(routes)
