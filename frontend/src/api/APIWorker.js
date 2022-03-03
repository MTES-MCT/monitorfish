import { useEffect, useRef, useState } from 'react'
import showAllVessels from '../domain/use_cases/showVesselsLastPosition'
import { batch, useDispatch, useSelector } from 'react-redux'
import getAllGearCodes from '../domain/use_cases/getAllGearCodes'
import updateVesselTracks from '../domain/use_cases/updateVesselTracks'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import getAllFleetSegments from '../domain/use_cases/getAllFleetSegments'
import getHealthcheck from '../domain/use_cases/getHealthcheck'
import getVesselVoyage from '../domain/use_cases/getVesselVoyage'
import getVesselControls from '../domain/use_cases/getVesselControls'
import { VesselSidebarTab } from '../domain/entities/vessel'
import getAllRegulatoryLayers from '../domain/use_cases/getAllRegulatoryLayers'
import getOperationalAlerts from '../domain/use_cases/getOperationalAlerts'
import getAllBeaconMalfunctions from '../domain/use_cases/getAllBeaconMalfunctions'
import openBeaconmalfunction from '../domain/use_cases/openBeaconMalfunction'
import getAllBeaconStatuses from '../domain/use_cases/getAllBeaconStatuses'
import openBeaconStatusInKanban from '../domain/use_cases/openBeaconStatusInKanban'
import getVesselBeaconMalfunctions from '../domain/use_cases/getVesselBeaconMalfunctions'

export const FIVE_MINUTES = 5 * 60 * 1000
export const THIRTY_SECONDS = 30 * 1000

const APIWorker = () => {
  const dispatch = useDispatch()
  const {
    vesselSidebarTab,
    selectedVesselIdentity
  } = useSelector(state => state.vessel)
  const {
    sideWindowIsOpen
  } = useSelector(state => state.global)
  const {
    openedBeaconMalfunctionInKanban
  } = useSelector(state => state.beaconMalfunction)

  const beaconMalfunctionsInterval = useRef(null)
  const beaconMalfunctionInterval = useRef(null)
  const [updateVesselSidebarTab, setUpdateVesselSidebarTab] = useState(false)

  useEffect(() => {
    batch(() => {
      dispatch(setIsUpdatingVessels())
      dispatch(getHealthcheck())
      dispatch(getAllGearCodes())
      dispatch(getAllFleetSegments())
      dispatch(showAllVessels())
      dispatch(getOperationalAlerts())
      dispatch(getAllBeaconMalfunctions())
      dispatch(getAllRegulatoryLayers())
    })

    const interval = setInterval(() => {
      batch(() => {
        dispatch(setIsUpdatingVessels())
        dispatch(getHealthcheck())
        dispatch(showAllVessels())
        dispatch(getOperationalAlerts())
        dispatch(updateVesselTracks())
      })

      setUpdateVesselSidebarTab(true)
    }, FIVE_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (sideWindowIsOpen) {
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
  }, [sideWindowIsOpen])

  useEffect(() => {
    if (sideWindowIsOpen && openedBeaconMalfunctionInKanban) {
      if (beaconMalfunctionInterval?.current) {
        clearInterval(beaconMalfunctionInterval.current)
      }

      beaconMalfunctionInterval.current = setInterval(() => {
        dispatch(openBeaconmalfunction(openedBeaconMalfunctionInKanban))
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(beaconMalfunctionInterval?.current)
    }
  }, [sideWindowIsOpen, openedBeaconMalfunctionInKanban])

  useEffect(() => {
    if (updateVesselSidebarTab) {
      if (vesselSidebarTab === VesselSidebarTab.VOYAGES) {
        if (selectedVesselIdentity) {
          dispatch(getVesselVoyage(selectedVesselIdentity, null, true))
        }
      } else if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
        dispatch(getVesselControls())
      } else if (vesselSidebarTab === VesselSidebarTab.ERSVMS) {
        dispatch(getVesselBeaconMalfunctions())
      }

      setUpdateVesselSidebarTab(false)
    }
  }, [selectedVesselIdentity, updateVesselSidebarTab, vesselSidebarTab])

  return null
}

export default APIWorker
