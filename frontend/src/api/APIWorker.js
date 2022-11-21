import { useEffect, useRef, useState } from 'react'
import { showVesselsLastPosition } from '../domain/use_cases/vessel/showVesselsLastPosition'
import { batch, useDispatch, useSelector } from 'react-redux'
import getAllGearCodes from '../domain/use_cases/gearCode/getAllGearCodes'
import updateVesselTracks from '../domain/use_cases/vessel/updateVesselTracks'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import getAllFleetSegments from '../domain/use_cases/fleetSegment/getAllFleetSegments'
import getHealthcheck from '../domain/use_cases/healthcheck/getHealthcheck'
import getVesselVoyage from '../domain/use_cases/vessel/getVesselVoyage'
import getVesselControls from '../domain/use_cases/vessel/getVesselControls'
import { VesselSidebarTab } from '../domain/entities/vessel/vessel'
import getAllRegulatoryLayers from '../domain/use_cases/layer/regulation/getAllRegulatoryLayers'
import { getOperationalAlerts } from '../domain/use_cases/alert/getOperationalAlerts'
import getAllBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import { openBeaconMalfunctionInKanban } from '../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import getVesselBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getVesselBeaconMalfunctions'
import getAllSpecies from '../domain/use_cases/species/getAllSpecies'
import getVesselReportings from '../domain/use_cases/vessel/getVesselReportings'
import { getSilencedAlerts } from '../domain/use_cases/alert/getSilencedAlerts'
import getFishingInfractions from '../domain/use_cases/infraction/getFishingInfractions'
import getAllControllers from '../domain/use_cases/controller/getAllControllers'
import { getAllCurrentReportings } from '../domain/use_cases/reporting/getAllCurrentReportings'

export const FIVE_MINUTES = 5 * 60 * 1000
export const THIRTY_SECONDS = 30 * 1000

const APIWorker = () => {
  const dispatch = useDispatch()
  const {
    vesselSidebarTab,
    selectedVesselIdentity
  } = useSelector(state => state.vessel)
  const {
    openedSideWindowTab,
    isAdmin
  } = useSelector(state => state.global)
  const {
    openedBeaconMalfunctionInKanban,
    vesselBeaconMalfunctionsResumeAndHistory
  } = useSelector(state => state.beaconMalfunction)

  const sideWindowInterval = useRef(null)
  const beaconMalfunctionInKanbanInterval = useRef(null)
  const vesselBeaconMalfunctionInterval = useRef(null)
  const [updateVesselSidebarTab, setUpdateVesselSidebarTab] = useState(false)

  useEffect(() => {
    batch(async () => {
      dispatch(setIsUpdatingVessels())
      dispatch(getHealthcheck())
      await dispatch(getAllSpecies())
      dispatch(getAllGearCodes())
      if (isAdmin) {
        dispatch(getAllFleetSegments())
        dispatch(getOperationalAlerts())
        dispatch(getAllCurrentReportings())
        dispatch(getSilencedAlerts())
        dispatch(getAllBeaconMalfunctions())
        dispatch(getAllControllers())
      }
      dispatch(showVesselsLastPosition())
      dispatch(getAllRegulatoryLayers())
      dispatch(getFishingInfractions())
    })

    const interval = setInterval(() => {
      batch(() => {
        dispatch(setIsUpdatingVessels())
        dispatch(getHealthcheck())
        dispatch(showVesselsLastPosition())
        dispatch(updateVesselTracks())
      })

      setUpdateVesselSidebarTab(true)
    }, FIVE_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [isAdmin])

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
  }, [isAdmin, openedSideWindowTab])

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
  }, [isAdmin, openedSideWindowTab, openedBeaconMalfunctionInKanban])

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
  }, [isAdmin, vesselBeaconMalfunctionsResumeAndHistory])

  useEffect(() => {
    if (updateVesselSidebarTab) {
      if (vesselSidebarTab === VesselSidebarTab.VOYAGES && selectedVesselIdentity) {
        dispatch(getVesselVoyage(selectedVesselIdentity, null, true))
      } else if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
        dispatch(getVesselControls())
      } else if (vesselSidebarTab === VesselSidebarTab.REPORTING) {
        dispatch(getVesselReportings())
      } else if (isAdmin && vesselSidebarTab === VesselSidebarTab.ERSVMS) {
        dispatch(getVesselBeaconMalfunctions())
      }

      setUpdateVesselSidebarTab(false)
    }
  }, [isAdmin, selectedVesselIdentity, updateVesselSidebarTab, vesselSidebarTab])

  return null
}

export default APIWorker
