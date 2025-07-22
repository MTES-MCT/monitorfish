import { ActivityVisualizationMap } from '@features/ActivityVisualization/components/ActivityVisualizationMap'
import { ControlObjectiveTable } from '@features/ControlObjective/components/ControlObjectiveTable'
import { FleetSegmentsBackoffice } from '@features/FleetSegment/components/FleetSegmentsBackoffice'
import { MainWindow } from '@features/MainWindow'
import { PriorNotificationSubscriberForm } from '@features/PriorNotification/components/PriorNotificationSubscriberForm'
import { PriorNotificationSubscriberTable } from '@features/PriorNotification/components/PriorNotificationSubscriberTable'
import { ProducerOrganizationMembershipTable } from '@features/ProducerOrganizationMembership/components/ProducerOrganizationMembershipTable'
import { RegulationForm } from '@features/Regulation/components/RegulationForm'
import { RegulationTables } from '@features/Regulation/components/RegulationTables'
import { SideWindow } from '@features/SideWindow'
import { ActivityVisualizationPage } from '@pages/ActivityVisualizationPage'
import { BackofficePage } from '@pages/BackofficePage'
import { HomePage } from '@pages/HomePage'
import { LightBackoffice } from '@pages/LightBackoffice'
import { LightHomePage } from '@pages/LightHomePage'
import { LoginPage } from '@pages/LoginPage'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { Login } from './auth/components/Login'
import { Register } from './auth/components/Register'
import { RequireAuth } from './auth/components/RequireAuth'
import { ROUTER_PATHS } from './paths'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const routes = [
  {
    path: ROUTER_PATHS.home,
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
    path: ROUTER_PATHS.light,
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
    path: ROUTER_PATHS.login,
    element: <LoginPage />,
    children: [
      {
        index: true,
        element: <Login />
      }
    ]
  },
  {
    path: ROUTER_PATHS.register,
    element: <Register />
  },
  {
    path: ROUTER_PATHS.activityVisualization,
    element: <ActivityVisualizationPage />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth redirect>
            <ActivityVisualizationMap />
          </RequireAuth>
        )
      }
    ]
  },
  {
    path: ROUTER_PATHS.loadLight,
    element: <LightBackoffice />
  },
  {
    path: ROUTER_PATHS.backoffice,
    element: <BackofficePage />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth redirect requireSuperUser>
            <RegulationTables />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.regulations,
        element: (
          <RequireAuth redirect requireSuperUser>
            <RegulationTables />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.newRegulation,
        element: (
          <RequireAuth redirect requireSuperUser>
            <RegulationForm isEdition={false} title="Saisir une nouvelle réglementation" />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.editRegulation,
        element: (
          <RequireAuth redirect requireSuperUser>
            <RegulationForm isEdition title="Modifier la réglementation de la zone" />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.controlObjectives,
        element: (
          <RequireAuth redirect requireSuperUser>
            <ControlObjectiveTable />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.fleetSegments,
        element: (
          <RequireAuth redirect requireSuperUser>
            <FleetSegmentsBackoffice />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.priorNotificationSubscribers,
        element: (
          <RequireAuth redirect requireSuperUser>
            <PriorNotificationSubscriberTable />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.editPriorNotificationSubscriber,
        element: (
          <RequireAuth redirect requireSuperUser>
            <PriorNotificationSubscriberForm />
          </RequireAuth>
        )
      },
      {
        path: ROUTER_PATHS.producerOrganizationMembership,
        element: (
          <RequireAuth redirect requireSuperUser>
            <ProducerOrganizationMembershipTable />
          </RequireAuth>
        )
      }
    ]
  },
  {
    path: ROUTER_PATHS.ext,
    element: <Navigate replace to="/" />
  },
  {
    path: ROUTER_PATHS.sideWindow,
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
