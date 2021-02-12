import {useEffect} from 'react';
import {useToasts} from 'react-toast-notifications'

import showAllVessels from "../domain/use_cases/showVesselsLastPosition";
import {useDispatch, useSelector} from "react-redux";
import getAllGearCodes from "../domain/use_cases/getAllGearCodes";
import updateVesselTrackAndSidebar from "../domain/use_cases/updateVesselTrackAndSidebar";

export const FIVE_MINUTES = 300000;

const APIWorker = () => {
    const error = useSelector(state => state.global.error)
    const dispatch = useDispatch()
    const { addToast } = useToasts()

    useEffect(() => {
        dispatch(getAllGearCodes())
        dispatch(showAllVessels());

        setInterval(() => {
            dispatch(showAllVessels());
            dispatch(updateVesselTrackAndSidebar())
        }, FIVE_MINUTES)
    }, [])

    useEffect(() => {
        if (error) {
            addToast(error.message.split(':')[0], {
                appearance: 'warning',
                autoDismiss: true,
            })
        }
    }, [error])

    return null
}

export default APIWorker
