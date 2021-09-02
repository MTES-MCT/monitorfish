import { useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'

import showAllVessels from '../domain/use_cases/showVesselsLastPosition'
import { batch, useDispatch, useSelector } from 'react-redux'
import getAllGearCodes from '../domain/use_cases/getAllGearCodes'
import updateVesselTrackAndSidebar from '../domain/use_cases/updateVesselTrackAndSidebar'
import { VESSELS_UPDATE_EVENT } from '../layers/VesselsLayer'
import { resetIsUpdatingVessels, setIsUpdatingVessels } from '../domain/shared_slices/Global'
import { errorType } from '../domain/entities/errors'
import getAllFleetSegments from '../domain/use_cases/getAllFleetSegments'
import getHealthcheck from '../domain/use_cases/getHealthcheck'
import getVesselVoyage from '../domain/use_cases/getVesselVoyage'
import getControls from '../domain/use_cases/getControls'
import { VesselSidebarTab } from '../domain/entities/vessel'
import getAllRegulatoryLayersByRegTerritory from '../domain/use_cases/getAllRegulatoryLayersByRegTerritory'
import { setRegulatoryLayers } from '../domain/shared_slices/Regulatory'
import { unByKey } from 'ol/Observable'

export const TWO_MINUTES = 120000

const APIWorker = () => {
  const dispatch = useDispatch()
  const error = useSelector(state => state.global.error)
  const {
    vesselsLayerSource,
    vesselSidebarTab,
    selectedVesselIdentity
  } = useSelector(state => state.vessel)
  const {
    layersTopicsByRegTerritory
  } = useSelector(state => state.regulatory)

  const { addToast } = useToasts()
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
        dispatch(updateVesselTrackAndSidebar())
      })

      setUpdateVesselSidebarTab(true)
    }, TWO_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (layersTopicsByRegTerritory) {
      let nextRegulatoryLayersWithoutTerritory = {}
      Object.keys(layersTopicsByRegTerritory).forEach(territory => {
        nextRegulatoryLayersWithoutTerritory = {
          ...nextRegulatoryLayersWithoutTerritory,
          ...layersTopicsByRegTerritory[territory]
        }
      })
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

  useEffect(() => {
    let eventKey
    if (vesselsLayerSource) {
      eventKey = vesselsLayerSource.on(VESSELS_UPDATE_EVENT, () => {
        dispatch(resetIsUpdatingVessels())
      })
    }

    return () => {
      if (eventKey) {
        unByKey(eventKey)
      }
    }
  }, [vesselsLayerSource])

  useEffect(() => {
    if (error) {
      if (error.type && error.type === errorType.INFO_AND_HIDDEN) {
        return
      }

      if (error.type) {
        addToast(error.message.split(':')[0], {
          appearance: error.type,
          autoDismiss: true,
          autoDismissTimeout: 10000
        })
      } else {
        addToast(error.message.split(':')[0], {
          appearance: 'warning',
          autoDismiss: true,
          autoDismissTimeout: 10000
        })
      }
    }
  }, [error])

  return null
}

export default APIWorker
