const Global = (state, action) => {
    const ticTac = value => {
        if (value === 'tic') {
            return 'tac'
        } else return 'tic'
    }

    switch (action.type) {
        case 'SET_ERROR':
            console.error(action.payload)
            return {
                ...state,
                error: action.payload
            };
        case 'CRON_EVENT':
            return {
                ...state,
                fetch: ticTac(state.fetch)
            };
        default:
            return state;
    }
};

export default Global;
