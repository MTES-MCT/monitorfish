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

export const ONE_MINUTE = 60000

const APIWorker = () => {
    const error = useSelector(state => state.global.error)
    const vesselsLayerSource = useSelector(state => state.vessel.vesselsLayerSource)
    const dispatch = useDispatch()
    const { addToast } = useToasts()

    useEffect(() => {
        dispatch(setIsUpdatingVessels())
        dispatch(getAllGearCodes())
        dispatch(getAllFleetSegments())
        dispatch(showAllVessels());

        const interval = setInterval(() => {
            dispatch(setIsUpdatingVessels())
            dispatch(showAllVessels());
            dispatch(updateVesselTrackAndSidebar())
        }, ONE_MINUTE)

        return () => {
            clearInterval(interval);
        }
    }, [])

    useEffect(() => {
        if(vesselsLayerSource) {
            vesselsLayerSource.on(VESSELS_UPDATE_EVENT, () => {
                setTimeout(() => {
                    dispatch(resetIsUpdatingVessels())
                }, 1000)
            })
        }
    }, [vesselsLayerSource])

    useEffect(() => {
        if (error) {
            if(error.type && error.type === errorType.INFO_AND_HIDDEN) {
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
