import { useEffect } from 'react'
import { useToasts } from 'react-toast-notifications'

import showAllVessels from '../domain/use_cases/showVesselsLastPosition'
import { useDispatch, useSelector } from 'react-redux'
import getAllGearCodes from '../domain/use_cases/getAllGearCodes'
import updateVesselTrackAndSidebar from '../domain/use_cases/updateVesselTrackAndSidebar'
import { VESSELS_UPDATE_EVENT } from '../layers/VesselsLayer'
import { resetIsUpdatingVessels, setIsUpdatingVessels } from '../domain/reducers/Global'
import { errorType } from '../domain/entities/errors'
import getAllFleetSegments from '../domain/use_cases/getAllFleetSegments'
import getHealthcheck from '../domain/use_cases/getHealthcheck'
import getVesselVoyage from '../domain/use_cases/getVesselVoyage'
import { VesselSidebarTab } from '../containers/VesselSidebar'
import getControls from '../domain/use_cases/getControls'

export const TWO_MINUTES = 120000

const APIWorker = () => {
  const dispatch = useDispatch()
  const error = useSelector(state => state.global.error)
  const {
    vesselsLayerSource,
    vesselSidebarTab,
    selectedVessel,
    selectedVesselFeatureAndIdentity
  } = useSelector(state => state.vessel)
  const { addToast } = useToasts()

  useEffect(() => {
    dispatch(setIsUpdatingVessels())
    dispatch(getHealthcheck())
    dispatch(getAllGearCodes())
    dispatch(getAllFleetSegments())
    dispatch(showAllVessels())

    const interval = setInterval(() => {
      dispatch(setIsUpdatingVessels())
      dispatch(getHealthcheck())
      dispatch(showAllVessels())
      dispatch(updateVesselTrackAndSidebar())
    }, TWO_MINUTES)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (vesselsLayerSource) {
      vesselsLayerSource.on(VESSELS_UPDATE_EVENT, () => {
        dispatch(resetIsUpdatingVessels())
      })
    }
  }, [vesselsLayerSource])

  useEffect(() => {
    if (selectedVessel) {
      if (vesselSidebarTab === VesselSidebarTab.VOYAGES) {
        if (selectedVesselFeatureAndIdentity && selectedVesselFeatureAndIdentity.identity) {
          dispatch(getVesselVoyage(selectedVesselFeatureAndIdentity.identity, null, true))
        }
      } else if (vesselSidebarTab === VesselSidebarTab.CONTROLS) {
        dispatch(getControls())
      }
    }
  }, [selectedVessel])

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
