import { useEffect, useRef, useState } from 'react'
import showAllVessels from '../domain/use_cases/showVesselsLastPosition'
import { batch, useDispatch, useSelector } from 'react-redux'
import getAllGearCodes from '../domain/use_cases/getAllGearCodes'
import updateVesselTracks from '../domain/use_cases/updateVesselTracks'
import { setIsUpdatingVessels } from '../domain/shared_slices/Global'
import getAllFleetSegments from '../domain/use_cases/getAllFleetSegments'
import getHealthcheck from '../domain/use_cases/getHealthcheck'
import getVesselVoyage from '../domain/use_cases/getVesselVoyage'
import getControls from '../domain/use_cases/getControls'
import { VesselSidebarTab } from '../domain/entities/vessel'
import getAllRegulatoryLayersByRegTerritory from '../domain/use_cases/getAllRegulatoryLayersByRegTerritory'
import { setRegulatoryLayers, setSelectedRegulatoryZone } from '../domain/shared_slices/Regulatory'
import { getRegulatoryLayersWithoutTerritory } from '../domain/entities/regulatory'
import getOperationalAlerts from '../domain/use_cases/getOperationalAlerts'
import getAllBeaconStatuses from '../domain/use_cases/getAllBeaconStatuses'
import openBeaconStatus from '../domain/use_cases/openBeaconStatus'
import { getLocalStorageState } from '../utils'
import { reOrderOldObjectHierarchyIfFound, SELECTED_REG_ZONES_LOCAL_STORAGE_KEY } from '../domain/entities/layers'

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
    openedBeaconStatus
  } = useSelector(state => state.beaconStatus)
  const {
    layersTopicsByRegTerritory,
    regulatoryLayers,
    selectedRegulatoryLayers
  } = useSelector(state => state.regulatory)

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
      dispatch(getAllRegulatoryLayersByRegTerritory())
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
    if (sideWindowIsOpen && openedBeaconStatus) {
      if (beaconStatusInterval?.current) {
        clearInterval(beaconStatusInterval.current)
      }

      beaconStatusInterval.current = setInterval(() => {
        dispatch(openBeaconStatus(openedBeaconStatus))
      }, THIRTY_SECONDS)
    }

    return () => {
      clearInterval(beaconStatusInterval?.current)
    }
  }, [sideWindowIsOpen, openedBeaconStatus])

  useEffect(() => {
    if (layersTopicsByRegTerritory) {
      // console.log('regulatory layers are loaded')
      // On  check ici si les reg sélectionnées sont bien ok ?
      const nextRegulatoryLayersWithoutTerritory = getRegulatoryLayersWithoutTerritory(layersTopicsByRegTerritory)
      // console.log(nextRegulatoryLayersWithoutTerritory)
      dispatch(setRegulatoryLayers(nextRegulatoryLayersWithoutTerritory))
    }
  }, [layersTopicsByRegTerritory, dispatch])

  useEffect(() => {
    if (regulatoryLayers && Object.keys(regulatoryLayers).length && !selectedRegulatoryLayers) {
      const selectedRegulatoryLayersLS = reOrderOldObjectHierarchyIfFound(getLocalStorageState({}, SELECTED_REG_ZONES_LOCAL_STORAGE_KEY))
      const nextSelectedRegulatoryLayers = {}
      Object.values(selectedRegulatoryLayersLS)
        .flat()
        .map(selectedRegulatoryZone => {
          const lawTypeRegulatoryZones = Object.values(regulatoryLayers[selectedRegulatoryZone.lawType]).flat()
          const nextRegulatoryZone = lawTypeRegulatoryZones.find(zone => zone.id === selectedRegulatoryZone.id)
          if (nextRegulatoryZone && nextRegulatoryZone.lawType && nextRegulatoryZone.topic) {
            if (Object.keys(nextSelectedRegulatoryLayers).includes(nextRegulatoryZone.topic)) {
              const nextRegZoneTopic = nextSelectedRegulatoryLayers[nextRegulatoryZone.topic]
              nextRegZoneTopic.push(nextRegulatoryZone)
              nextSelectedRegulatoryLayers[nextRegulatoryZone.topic] = nextRegZoneTopic
            } else {
              nextSelectedRegulatoryLayers[nextRegulatoryZone.topic] = [nextRegulatoryZone]
            }
            return null
          }
          return null
        })
      dispatch(setSelectedRegulatoryZone(nextSelectedRegulatoryLayers))
    }
  }, [regulatoryLayers, selectedRegulatoryLayers, dispatch])

  useEffect(() => {
    if (updateVesselSidebarTab) {
      if (vesselSidebarTab === VesselSidebarTab.VOYAGES) {
        if (selectedVesselIdentity) {
          dispatch(getVesselVoyage(selectedVesselIdentity, null, true))
        }
      } else if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
        dispatch(getControls())
      }

      setUpdateVesselSidebarTab(false)
    }
  }, [selectedVesselIdentity, updateVesselSidebarTab, vesselSidebarTab])

  return null
}

export default APIWorker
