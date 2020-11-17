const Global = (state, action) => {
    const ticTac = value => {
        if (value === 'tic') {
            return 'tac'
        } else return 'tic'
    }

    switch (action.type) {
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload
            };
        case 'CRON_EVENT':
            return {
                ...state,
                fetchVessels: ticTac(state.fetchVessels)
            };
        default:
            return state;
    }
};

export default Global;
