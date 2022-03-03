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
    openedBeaconStatusInKanban
  } = useSelector(state => state.beaconStatus)

  const beaconStatusesInterval = useRef(null)
  const beaconStatusInterval = useRef(null)
  const [updateVesselSidebarTab, setUpdateVesselSidebarTab] = useState(false)

  useEffect(() => {
    batch(() => {
      dispatch(setIsUpdatingVessels())
      dispatch(getHealthcheck())
      dispatch(getAllGearCodes())
      dispatch(getAllFleetSegments())
      dispatch(showAllVessels())
      dispatch(getOperationalAlerts())
      dispatch(getAllRegulatoryLayers())
      dispatch(getAllBeaconStatuses())
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
      if (beaconStatusesInterval?.current) {
        clearInterval(beaconStatusesInterval.current)
      }

      beaconStatusesInterval.current = setInterval(() => {
        dispatch(getAllBeaconStatuses())
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(beaconStatusesInterval?.current)
    }
  }, [sideWindowIsOpen])

  useEffect(() => {
    if (sideWindowIsOpen && openedBeaconStatusInKanban) {
      if (beaconStatusInterval?.current) {
        clearInterval(beaconStatusInterval.current)
      }

      beaconStatusInterval.current = setInterval(() => {
        dispatch(openBeaconStatusInKanban(openedBeaconStatusInKanban))
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(beaconStatusInterval?.current)
    }
  }, [sideWindowIsOpen, openedBeaconStatusInKanban])

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
