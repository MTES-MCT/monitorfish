import {useContext, useEffect} from 'react';
import { useToasts } from 'react-toast-notifications'

import {Context} from "../Store";
import {getVessels, getVessel} from "./fetch";

export const SIXTY_SECONDS = 60000;

const APIWorker = () => {
    const [state, dispatch] = useContext(Context)
    const { addToast } = useToasts()

    useEffect(() => {
        setInterval(() => {
            dispatch({type: 'CRON_EVENT'});
        }, SIXTY_SECONDS)
    }, [])

    useEffect(() => {
        getVessels(dispatch).then(vessels => {
            dispatch({type: 'SET_VESSELS', payload: vessels})
        })

        if (state.vessel.vesselTrackToShow) {
            getVessel(dispatch, state.vessel.vesselTrackToShow.getProperties().internalReferenceNumber).then(vessel => {
                dispatch({type: 'SET_VESSEL', payload: vessel})
            })
        }
    }, [state.global.fetchVessels, state.vessel.vesselTrackToShow])

    useEffect(() => {
        if (state.global.error) {
            addToast(state.global.error.message, {
                appearance: 'warning',
                autoDismiss: true,
            })
        }
    }, [state.global.error])

    return null
}

export default APIWorker
