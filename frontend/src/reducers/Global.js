const Global = (state, action) => {
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
                fetch: true
            };
        default:
            return state;
    }
};

export default Global;
