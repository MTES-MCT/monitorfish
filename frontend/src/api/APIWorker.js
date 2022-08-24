import { useEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'

import { VesselSidebarTab } from '../domain/entities/vessel'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import getOperationalAlerts from '../domain/use_cases/alert/getOperationalAlerts'
import getVesselBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getVesselBeaconMalfunctions'
import getAllSpecies from '../domain/use_cases/species/getAllSpecies'
import getVesselReportings from '../domain/use_cases/vessel/getVesselReportings'
import getSilencedAlerts from '../domain/use_cases/alert/getSilencedAlerts'
import getAllBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import openBeaconMalfunctionInKanban from '../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import getFishingInfractions from '../domain/use_cases/infraction/getFishingInfractions'
import getAllControllers from '../domain/use_cases/controller/getAllControllers'
import getAllFleetSegments from '../domain/use_cases/fleetSegment/getAllFleetSegments'
import getAllGearCodes from '../domain/use_cases/gearCode/getAllGearCodes'
import getHealthcheck from '../domain/use_cases/healthcheck/getHealthcheck'
import getAllRegulatoryLayers from '../domain/use_cases/layer/regulation/getAllRegulatoryLayers'
import getVesselControls from '../domain/use_cases/vessel/getVesselControls'
import getVesselVoyage from '../domain/use_cases/vessel/getVesselVoyage'
import showAllVessels from '../domain/use_cases/vessel/showVesselsLastPosition'
import updateVesselTracks from '../domain/use_cases/vessel/updateVesselTracks'

export const FIVE_MINUTES = 5 * 60 * 1000
export const THIRTY_SECONDS = 30 * 1000

function APIWorker() {
  const dispatch = useDispatch()
  const { selectedVesselIdentity, vesselSidebarTab } = useSelector(state => state.vessel)
  const { adminRole, sideWindowIsOpen } = useSelector(state => state.global)
  const { openedBeaconMalfunctionInKanban, vesselBeaconMalfunctionsResumeAndHistory } = useSelector(
    state => state.beaconMalfunction,
  )

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
      if (adminRole) {
        dispatch(getAllFleetSegments())
        dispatch(getOperationalAlerts())
        dispatch(getSilencedAlerts())
        dispatch(getAllBeaconMalfunctions())
        dispatch(getAllControllers())
      }
      dispatch(showAllVessels())
      dispatch(getAllRegulatoryLayers())
      dispatch(getFishingInfractions())
    })

    const interval = setInterval(() => {
      batch(() => {
        dispatch(setIsUpdatingVessels())
        dispatch(getHealthcheck())
        dispatch(showAllVessels())
        dispatch(updateVesselTracks())
      })

      setUpdateVesselSidebarTab(true)
    }, FIVE_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [adminRole])

  useEffect(() => {
    if (adminRole && sideWindowIsOpen) {
      if (sideWindowInterval?.current) {
        clearInterval(sideWindowInterval.current)
      }

      sideWindowInterval.current = setInterval(() => {
        dispatch(getAllBeaconMalfunctions())
        dispatch(getOperationalAlerts())
        dispatch(getSilencedAlerts())
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(sideWindowInterval?.current)
    }
  }, [adminRole, sideWindowIsOpen])

  useEffect(() => {
    if (adminRole && sideWindowIsOpen && openedBeaconMalfunctionInKanban) {
      if (beaconMalfunctionInKanbanInterval?.current) {
        clearInterval(beaconMalfunctionInKanbanInterval.current)
      }

      beaconMalfunctionInKanbanInterval.current = setInterval(() => {
        dispatch(openBeaconMalfunctionInKanban(openedBeaconMalfunctionInKanban))
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(beaconMalfunctionInKanbanInterval?.current)
    }
  }, [adminRole, sideWindowIsOpen, openedBeaconMalfunctionInKanban])

  useEffect(() => {
    if (adminRole && vesselBeaconMalfunctionsResumeAndHistory) {
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
  }, [adminRole, vesselBeaconMalfunctionsResumeAndHistory])

  useEffect(() => {
    if (updateVesselSidebarTab) {
      if (vesselSidebarTab === VesselSidebarTab.VOYAGES && selectedVesselIdentity) {
        dispatch(getVesselVoyage(selectedVesselIdentity, null, true))
      } else if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
        dispatch(getVesselControls())
      } else if (vesselSidebarTab === VesselSidebarTab.REPORTING) {
        dispatch(getVesselReportings())
      } else if (adminRole && vesselSidebarTab === VesselSidebarTab.ERSVMS) {
        dispatch(getVesselBeaconMalfunctions())
      }

      setUpdateVesselSidebarTab(false)
    }
  }, [adminRole, selectedVesselIdentity, updateVesselSidebarTab, vesselSidebarTab])

  return null
}

export default APIWorker
