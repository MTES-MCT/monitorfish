import {useEffect} from 'react';
import { useToasts } from 'react-toast-notifications'

import showAllVessels from "../use_cases/showVesselsLastPosition";
import {useDispatch, useSelector} from "react-redux";
import getAllGearCodes from "../use_cases/getAllGearCodes";

export const FIVE_MINUTES = 300000;

const APIWorker = () => {
    const error = useSelector(state => state.global.error)
    const dispatch = useDispatch()
    const { addToast } = useToasts()

    useEffect(() => {
        dispatch(showAllVessels());
        dispatch(getAllGearCodes())

        setInterval(() => {
            dispatch(showAllVessels());
        }, FIVE_MINUTES)
    }, [])

    useEffect(() => {
        if (error) {
            addToast(error.message, {
                appearance: 'warning',
                autoDismiss: true,
            })
        }
    }, [error])

    return null
}

export default APIWorker
