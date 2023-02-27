import { useEffect, useRef, useState } from 'react'

import { fleetSegmentApi } from './fleetSegment'
import { VesselSidebarTab } from '../domain/entities/vessel/vessel'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import { getOperationalAlerts } from '../domain/use_cases/alert/getOperationalAlerts'
import { getSilencedAlerts } from '../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import getVesselBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getVesselBeaconMalfunctions'
import { openBeaconMalfunctionInKanban } from '../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import getAllGearCodes from '../domain/use_cases/gearCode/getAllGearCodes'
import getHealthcheck from '../domain/use_cases/healthcheck/getHealthcheck'
import getFishingInfractions from '../domain/use_cases/infraction/getFishingInfractions'
import getAllRegulatoryLayers from '../domain/use_cases/layer/regulation/getAllRegulatoryLayers'
import { getVesselControls } from '../domain/use_cases/missions/getVesselControls'
import { getAllCurrentReportings } from '../domain/use_cases/reporting/getAllCurrentReportings'
import getAllSpecies from '../domain/use_cases/species/getAllSpecies'
import getVesselReportings from '../domain/use_cases/vessel/getVesselReportings'
import { getVesselVoyage } from '../domain/use_cases/vessel/getVesselVoyage'
import { showVesselsLastPosition } from '../domain/use_cases/vessel/showVesselsLastPosition'
import { updateVesselTracks } from '../domain/use_cases/vessel/updateVesselTracks'
import { useMainAppDispatch } from '../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../hooks/useMainAppSelector'

export const FIVE_MINUTES = 5 * 60 * 1000
export const THIRTY_SECONDS = 30 * 1000

// TODO Move these `useEffect`s to dispatchers, in order to remove logic from this component
export function APIWorker() {
  const dispatch = useMainAppDispatch()
  const { selectedVesselIdentity, vesselSidebarTab } = useMainAppSelector(state => state.vessel)
  const { isAdmin, openedSideWindowTab } = useMainAppSelector(state => state.global)
  const { openedBeaconMalfunctionInKanban, vesselBeaconMalfunctionsResumeAndHistory } = useMainAppSelector(
    state => state.beaconMalfunction
  )

  const sideWindowInterval = useRef<NodeJS.Timer>()
  const beaconMalfunctionInKanbanInterval = useRef<NodeJS.Timer>()
  const vesselBeaconMalfunctionInterval = useRef<NodeJS.Timer>()
  const [updateVesselSidebarTab, setUpdateVesselSidebarTab] = useState(false)

  useEffect(() => {
    if (isAdmin === undefined) {
      return () => {}
    }

    dispatch(setIsUpdatingVessels())
    dispatch(getHealthcheck())
    dispatch(getAllSpecies()).then(() => dispatch(getAllRegulatoryLayers()))
    dispatch(getAllGearCodes())

    if (isAdmin) {
      dispatch(fleetSegmentApi.endpoints.getFleetSegments.initiate())
      dispatch(getOperationalAlerts())
      dispatch(getAllCurrentReportings())
      dispatch(getSilencedAlerts())
      dispatch(getAllBeaconMalfunctions())
    }

    dispatch(showVesselsLastPosition())
    dispatch(getFishingInfractions())

    const interval = setInterval(() => {
      dispatch(setIsUpdatingVessels())
      dispatch(getHealthcheck())
      dispatch(showVesselsLastPosition())
      dispatch(updateVesselTracks())

      setUpdateVesselSidebarTab(true)
    }, FIVE_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [dispatch, isAdmin])

  useEffect(() => {
    if (isAdmin && openedSideWindowTab) {
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
  }, [dispatch, isAdmin, openedSideWindowTab])

  useEffect(() => {
    if (isAdmin && openedSideWindowTab && openedBeaconMalfunctionInKanban) {
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
  }, [dispatch, isAdmin, openedSideWindowTab, openedBeaconMalfunctionInKanban])

  useEffect(() => {
    if (isAdmin && vesselBeaconMalfunctionsResumeAndHistory) {
      if (vesselBeaconMalfunctionInterval?.current) {
        clearInterval(vesselBeaconMalfunctionInterval.current)
      }

      vesselBeaconMalfunctionInterval.current = setInterval(() => {
        dispatch(getVesselBeaconMalfunctions(true))
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(vesselBeaconMalfunctionInterval?.current)
    }
  }, [dispatch, isAdmin, vesselBeaconMalfunctionsResumeAndHistory])

  useEffect(() => {
    if (!updateVesselSidebarTab) {
      return
    }

    if (vesselSidebarTab === VesselSidebarTab.VOYAGES && selectedVesselIdentity) {
      dispatch(getVesselVoyage(selectedVesselIdentity, undefined, true))
    } else if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
      dispatch(getVesselControls(false))
    } else if (vesselSidebarTab === VesselSidebarTab.REPORTING) {
      dispatch(getVesselReportings())
    } else if (isAdmin && vesselSidebarTab === VesselSidebarTab.ERSVMS) {
      dispatch(getVesselBeaconMalfunctions(true))
    }

    setUpdateVesselSidebarTab(false)
  }, [dispatch, isAdmin, selectedVesselIdentity, updateVesselSidebarTab, vesselSidebarTab])

  return null
}
