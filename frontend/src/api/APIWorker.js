import { useEffect, useState } from 'react'
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
import { setRegulatoryLayers } from '../domain/shared_slices/Regulatory'
import { getRegulatoryLayersWithoutTerritory } from '../domain/entities/regulatory'

export const TEN_MINUTES = 600000

const APIWorker = () => {
  const dispatch = useDispatch()
  const {
    vesselSidebarTab,
    selectedVesselIdentity
  } = useSelector(state => state.vessel)
  const {
    layersTopicsByRegTerritory
  } = useSelector(state => state.regulatory)

  const [updateVesselSidebarTab, setUpdateVesselSidebarTab] = useState(false)

  useEffect(() => {
    batch(() => {
      dispatch(setIsUpdatingVessels())
      dispatch(getHealthcheck())
      dispatch(getAllGearCodes())
      dispatch(getAllFleetSegments())
      dispatch(showAllVessels())
      dispatch(getAllRegulatoryLayersByRegTerritory())
    })

    const interval = setInterval(() => {
      batch(() => {
        dispatch(setIsUpdatingVessels())
        dispatch(getHealthcheck())
        dispatch(showAllVessels())
        dispatch(updateVesselTracks())
      })

      setUpdateVesselSidebarTab(true)
    }, TEN_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (layersTopicsByRegTerritory) {
      const nextRegulatoryLayersWithoutTerritory = getRegulatoryLayersWithoutTerritory(layersTopicsByRegTerritory)
      dispatch(setRegulatoryLayers(nextRegulatoryLayersWithoutTerritory))
    }
  }, [layersTopicsByRegTerritory])

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
