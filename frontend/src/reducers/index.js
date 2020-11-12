import layer from './Layer'
import global from './Global'
import vessel from './Vessel'

function combineReducers(reducers) {
    return (state = {}, action) => {
        const newState = {};
        for (let key in reducers) {
            newState[key] = reducers[key](state[key], action);
        }
        return newState;
    }
}

export default combineReducers({
    layer: layer,
    global: global,
    vessel: vessel,
})
