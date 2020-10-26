import React, {createContext, useReducer} from "react";
import reducer from './reducers'


const initialState = {
    layer: {
        layers: []
    },
    ship: {

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