import { useEffect, useRef, useState } from 'react'

import { fleetSegmentApi } from './fleetSegment'
import { SideWindowStatus } from '../domain/entities/sideWindow/constants'
import { VesselSidebarTab } from '../domain/entities/vessel/vessel'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import { getOperationalAlerts } from '../domain/use_cases/alert/getOperationalAlerts'
import { getSilencedAlerts } from '../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import { getVesselBeaconMalfunctions } from '../domain/use_cases/beaconMalfunction/getVesselBeaconMalfunctions'
import { openBeaconMalfunctionInKanban } from '../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import getAllGearCodes from '../domain/use_cases/gearCode/getAllGearCodes'
import { getInfractions } from '../domain/use_cases/infraction/getInfractions'
import getAllRegulatoryLayers from '../domain/use_cases/layer/regulation/getAllRegulatoryLayers'
import { getVesselControls } from '../domain/use_cases/mission/getVesselControls'
import { getAllCurrentReportings } from '../domain/use_cases/reporting/getAllCurrentReportings'
import getAllSpecies from '../domain/use_cases/species/getAllSpecies'
import { getVesselReportings } from '../domain/use_cases/vessel/getVesselReportings'
import { updateVesselTracks } from '../domain/use_cases/vessel/updateVesselTracks'
import { useIsSuperUser } from '../hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../hooks/useMainAppSelector'

export const FIVE_MINUTES = 5 * 60 * 1000
export const TWENTY_MINUTES = 20 * 60 * 1000
export const THIRTY_SECONDS = 30 * 1000

// TODO Move these `useEffect`s to dispatchers, in order to remove logic from this component
export function APIWorker() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const { selectedVesselIdentity, vesselSidebarTab } = useMainAppSelector(state => state.vessel)
  const sideWindow = useMainAppSelector(state => state.sideWindow)
  const { openedBeaconMalfunctionInKanban, vesselBeaconMalfunctionsResumeAndHistory } = useMainAppSelector(
    state => state.beaconMalfunction
  )

  const sideWindowInterval = useRef<NodeJS.Timer>()
  const beaconMalfunctionInKanbanInterval = useRef<NodeJS.Timer>()
  const vesselBeaconMalfunctionInterval = useRef<NodeJS.Timer>()
  const [updateVesselSidebarTab, setUpdateVesselSidebarTab] = useState(false)

  useEffect(() => {
    if (isSuperUser === undefined) {
      return () => {}
    }

    dispatch(setIsUpdatingVessels())
    dispatch(getAllSpecies()).then(() => dispatch(getAllRegulatoryLayers()))
    dispatch(getAllGearCodes())

    if (isSuperUser) {
      dispatch(fleetSegmentApi.endpoints.getFleetSegments.initiate())
      dispatch(getOperationalAlerts())
      dispatch(getAllCurrentReportings())
      dispatch(getSilencedAlerts())
      dispatch(getAllBeaconMalfunctions())
    }

    dispatch(getInfractions())

    const interval = setInterval(() => {
      dispatch(setIsUpdatingVessels())
      dispatch(updateVesselTracks())

      setUpdateVesselSidebarTab(true)
    }, FIVE_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, isSuperUser])

  useEffect(() => {
    if (isSuperUser && sideWindow.status !== SideWindowStatus.CLOSED) {
      if (sideWindowInterval?.current) {
        clearInterval(sideWindowInterval.current)
      }

      sideWindowInterval.current = setInterval(() => {
        dispatch(getAllBeaconMalfunctions())
        dispatch(getOperationalAlerts())
        dispatch(getAllCurrentReportings())
        dispatch(getSilencedAlerts())
      }, THIRTY_SECONDS)
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
      }, THIRTY_SECONDS)
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
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(vesselBeaconMalfunctionInterval?.current)
    }
  }, [dispatch, isSuperUser, vesselBeaconMalfunctionsResumeAndHistory])

  useEffect(() => {
    if (!updateVesselSidebarTab) {
      return
    }

    if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
      dispatch(getVesselControls(false))
    } else if (vesselSidebarTab === VesselSidebarTab.REPORTING) {
      dispatch(getVesselReportings(false))
    } else if (isSuperUser && vesselSidebarTab === VesselSidebarTab.ERSVMS) {
      dispatch(getVesselBeaconMalfunctions(false))
    }

    setUpdateVesselSidebarTab(false)
  }, [dispatch, isSuperUser, selectedVesselIdentity, updateVesselSidebarTab, vesselSidebarTab])

  return null
}
