import { getOperationalAlerts } from '@features/Alert/useCases/getOperationalAlerts'
import { getSilencedAlerts } from '@features/Alert/useCases/getSilencedAlerts'
import { getAllBeaconMalfunctions } from '@features/BeaconMalfunction/useCases/getAllBeaconMalfunctions'
import { getVesselBeaconMalfunctions } from '@features/BeaconMalfunction/useCases/getVesselBeaconMalfunctions'
import { openBeaconMalfunctionInKanban } from '@features/BeaconMalfunction/useCases/openBeaconMalfunctionInKanban'
import { fleetSegmentApi } from '@features/FleetSegment/apis'
import { getAllRegulatoryLayers } from '@features/Regulation/useCases/getAllRegulatoryLayers'
import { reportingApi } from '@features/Reporting/reportingApi'
import { SideWindowStatus } from '@features/SideWindow/constants'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'
import { updateVesselTracks } from '@features/Vessel/useCases/updateVesselTracks'
import { useCallback, useEffect, useRef, useState } from 'react'

import { WindowContext } from './constants'
import { useIsSuperUser } from '../auth/hooks/useIsSuperUser'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import { getAllGearCodes } from '../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../domain/use_cases/infraction/getInfractions'
import { getAllSpecies } from '../domain/use_cases/species/getAllSpecies'
import { useMainAppDispatch } from '../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../hooks/useMainAppSelector'

import type { MainAppAsyncThunk } from '@store'

export const FIVE_MINUTES = 5 * 60 * 1000
export const TWENTY_MINUTES = 20 * 60 * 1000
export const TWENTY_SECONDS = 20 * 1000

// TODO Move these `useEffect`s to dispatchers, in order to remove logic from this component
export function APIWorker() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const selectedVesselSidebarTab = useMainAppSelector(state => state.vessel.selectedVesselSidebarTab)
  const sideWindow = useMainAppSelector(state => state.sideWindow)
  const openedBeaconMalfunctionInKanban = useMainAppSelector(
    state => state.beaconMalfunction.openedBeaconMalfunctionInKanban
  )
  const vesselBeaconMalfunctionsResumeAndHistory = useMainAppSelector(
    state => state.beaconMalfunction.vesselBeaconMalfunctionsResumeAndHistory
  )

  const sideWindowInterval = useRef<number>()
  const beaconMalfunctionInKanbanInterval = useRef<number>()
  const vesselBeaconMalfunctionInterval = useRef<number>()
  const [updateVesselSidebarTab, setUpdateVesselSidebarTab] = useState(false)

  const load = useCallback(async () => {
    dispatch(setIsUpdatingVessels())
    dispatch(getAllGearCodes<MainAppAsyncThunk>(WindowContext.MainWindow))

    if (isSuperUser) {
      dispatch(fleetSegmentApi.endpoints.getFleetSegments.initiate())
      dispatch(getOperationalAlerts())
      dispatch(reportingApi.endpoints.getReportings.initiate())
      dispatch(getSilencedAlerts())
      dispatch(getAllBeaconMalfunctions())
    }

    dispatch(getInfractions())
    // This `await` must be kept at the end of the function to prevent blocking of other fetch
    await dispatch(getAllSpecies<MainAppAsyncThunk>(WindowContext.MainWindow))
    dispatch(getAllRegulatoryLayers())
  }, [dispatch, isSuperUser])

  const poll = useCallback(() => {
    dispatch(setIsUpdatingVessels())
    dispatch(updateVesselTracks())
    if (isSuperUser) {
      dispatch(getAllBeaconMalfunctions())
    }

    setUpdateVesselSidebarTab(true)
  }, [dispatch, isSuperUser])

  useEffect(() => {
    if (isSuperUser === undefined) {
      return () => {}
    }

    load()

    // TODO Use a RTK query hook with polling, within a global hook if really necessary.
    const interval = setInterval(poll, FIVE_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, isSuperUser, load, poll])

  useEffect(() => {
    if (isSuperUser && sideWindow.status !== SideWindowStatus.CLOSED) {
      if (sideWindowInterval?.current) {
        clearInterval(sideWindowInterval.current)
      }

      // TODO Use a RTK query hook with polling, within a global hook if really necessary.
      sideWindowInterval.current = setInterval(() => {
        dispatch(getAllBeaconMalfunctions())
        dispatch(getOperationalAlerts())
        dispatch(getSilencedAlerts())
      }, TWENTY_SECONDS) as any
    }

    return () => {
      clearInterval(sideWindowInterval?.current)
    }
  }, [dispatch, isSuperUser, sideWindow.status])

  useEffect(() => {
    if (isSuperUser && sideWindow.status !== SideWindowStatus.CLOSED && openedBeaconMalfunctionInKanban) {
      if (beaconMalfunctionInKanbanInterval?.current) {
        clearInterval(beaconMalfunctionInKanbanInterval.current)
      }

      beaconMalfunctionInKanbanInterval.current = setInterval(() => {
        dispatch(openBeaconMalfunctionInKanban(openedBeaconMalfunctionInKanban.beaconMalfunction.id))
      }, TWENTY_SECONDS) as any
    }

    return () => {
      clearInterval(beaconMalfunctionInKanbanInterval?.current)
    }
  }, [dispatch, isSuperUser, openedBeaconMalfunctionInKanban, sideWindow.status])

  useEffect(() => {
    if (isSuperUser && vesselBeaconMalfunctionsResumeAndHistory) {
      if (vesselBeaconMalfunctionInterval?.current) {
        clearInterval(vesselBeaconMalfunctionInterval.current)
      }

      vesselBeaconMalfunctionInterval.current = setInterval(() => {
        dispatch(getVesselBeaconMalfunctions(false))
      }, TWENTY_SECONDS) as any
    }

    return () => {
      clearInterval(vesselBeaconMalfunctionInterval?.current)
    }
  }, [dispatch, isSuperUser, vesselBeaconMalfunctionsResumeAndHistory])

  useEffect(() => {
    if (!updateVesselSidebarTab) {
      return
    }

    if (isSuperUser && selectedVesselSidebarTab === VesselSidebarTab.ERSVMS) {
      dispatch(getVesselBeaconMalfunctions(false))
    }

    setUpdateVesselSidebarTab(false)
  }, [dispatch, isSuperUser, selectedVesselIdentity, updateVesselSidebarTab, selectedVesselSidebarTab])

  return null
}
