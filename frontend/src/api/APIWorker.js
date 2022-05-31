import { useEffect, useRef, useState } from 'react'
import showAllVessels from '../domain/use_cases/vessel/showVesselsLastPosition'
import { batch, useDispatch, useSelector } from 'react-redux'
import getAllGearCodes from '../domain/use_cases/gearCode/getAllGearCodes'
import updateVesselTracks from '../domain/use_cases/vessel/updateVesselTracks'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import getAllFleetSegments from '../domain/use_cases/fleetSegment/getAllFleetSegments'
import getHealthcheck from '../domain/use_cases/healthcheck/getHealthcheck'
import getVesselVoyage from '../domain/use_cases/vessel/getVesselVoyage'
import getVesselControls from '../domain/use_cases/vessel/getVesselControls'
import { VesselSidebarTab } from '../domain/entities/vessel'
import getAllRegulatoryLayers from '../domain/use_cases/layer/regulation/getAllRegulatoryLayers'
import getOperationalAlerts from '../domain/use_cases/alert/getOperationalAlerts'
import getAllBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getAllBeaconMalfunctions'
import openBeaconMalfunctionInKanban from '../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import getVesselBeaconMalfunctions from '../domain/use_cases/beaconMalfunction/getVesselBeaconMalfunctions'
import getAllSpecies from '../domain/use_cases/species/getAllSpecies'
import getVesselReporting from '../domain/use_cases/vessel/getVesselReporting'

export const FIVE_MINUTES = 5 * 60 * 1000
export const THIRTY_SECONDS = 30 * 1000

const APIWorker = () => {
  const dispatch = useDispatch()
  const {
    vesselSidebarTab,
    selectedVesselIdentity
  } = useSelector(state => state.vessel)
  const {
    sideWindowIsOpen,
    adminRole
  } = useSelector(state => state.global)
  const {
    openedBeaconMalfunctionInKanban,
    vesselBeaconMalfunctionsResumeAndHistory
  } = useSelector(state => state.beaconMalfunction)

  const beaconMalfunctionsInterval = useRef(null)
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
        dispatch(getAllBeaconMalfunctions())
      }
      dispatch(showAllVessels())
      dispatch(getAllRegulatoryLayers())
    })

    const interval = setInterval(() => {
      batch(() => {
        dispatch(setIsUpdatingVessels())
        dispatch(getHealthcheck())
        dispatch(showAllVessels())
        if (adminRole) {
          dispatch(getOperationalAlerts())
        }
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
      if (beaconMalfunctionsInterval?.current) {
        clearInterval(beaconMalfunctionsInterval.current)
      }

      beaconMalfunctionsInterval.current = setInterval(() => {
        dispatch(getAllBeaconMalfunctions())
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(beaconMalfunctionsInterval?.current)
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
      if (vesselSidebarTab === VesselSidebarTab.VOYAGES) {
        if (selectedVesselIdentity) {
          dispatch(getVesselVoyage(selectedVesselIdentity, null, true))
        }
      } else if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
        dispatch(getVesselControls())
      } else if (vesselSidebarTab === VesselSidebarTab.REPORTING) {
        dispatch(getVesselReporting())
      } else if (adminRole && vesselSidebarTab === VesselSidebarTab.ERSVMS) {
        dispatch(getVesselBeaconMalfunctions())
      }

      setUpdateVesselSidebarTab(false)
    }
  }, [adminRole, selectedVesselIdentity, updateVesselSidebarTab, vesselSidebarTab])

  return null
}

export default APIWorker
