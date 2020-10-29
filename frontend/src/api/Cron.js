import {useContext, useEffect} from 'react';
import {Context} from "../Store";

export const THIRTY_SECONDS = 30000;

const Cron = () => {
    const [_, dispatch] = useContext(Context)

    useEffect(() => {
        setInterval(() => {
            dispatch({type: 'CRON_EVENT'});
        }, THIRTY_SECONDS)
    }, [])

    return null
}

export default Cron
