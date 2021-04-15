import { useEffect, useState } from 'react'
import {useToasts} from 'react-toast-notifications'

import showAllVessels from "../domain/use_cases/showVesselsLastPosition";
import {useDispatch, useSelector} from "react-redux";
import getAllGearCodes from "../domain/use_cases/getAllGearCodes";
import updateVesselTrackAndSidebar from "../domain/use_cases/updateVesselTrackAndSidebar";
import { VESSELS_UPDATE_EVENT } from '../layers/VesselsLayer'
import { resetIsUpdatingVessels, setIsUpdatingVessels } from '../domain/reducers/Global'
import NoDEPFoundError from '../errors/NoDEPFoundError'
import { exceptionsWithInfoToast } from '../domain/entities/errors'

export const ONE_MINUTE = 60000

const APIWorker = () => {
    const error = useSelector(state => state.global.error)
    const vesselsLayerSource = useSelector(state => state.vessel.vesselsLayerSource)
    const dispatch = useDispatch()
    const { addToast } = useToasts()

    useEffect(() => {
        dispatch(setIsUpdatingVessels())
        dispatch(getAllGearCodes())
        dispatch(showAllVessels());

        setInterval(() => {
            dispatch(setIsUpdatingVessels())
            dispatch(showAllVessels());
            dispatch(updateVesselTrackAndSidebar())
        }, ONE_MINUTE)

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
            if(exceptionsWithInfoToast.includes(error.name)) {
                addToast(error.message.split(':')[0], {
                    appearance: 'info',
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
