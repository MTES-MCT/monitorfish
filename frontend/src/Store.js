import React, {createContext, useReducer} from "react";
import reducer from './reducers'

const getLocalStorageState = (defaultValue, key) => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
        ? JSON.parse(stickyValue)
        : defaultValue;
}

const initialState = {
    layer: {
        layers: []
    },
    vessel: {
        showVesselNames: getLocalStorageState(false, 'SHOW_VESSEL_NAMES'),
        vesselNamesZoomHide: false
    },
    global: {
        error: null
    }
};

const Store = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <Context.Provider value={[state, dispatch]}>
            {children}
        </Context.Provider>
    )
};

export const Context = createContext(initialState);
export default Store;
