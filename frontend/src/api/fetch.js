export function getShips(setShips, dispatch) {
    fetch('/bff/v1/positions')
        .then(response => response.json())
        .then(ships => {
            setShips(ships)
        })
        .catch(error => {
            dispatch({type: 'SET_ERROR', payload: error});
        });
}

export function getShipTrack(setShipTrack, dispatch, shipTrackInternalReferenceNumberToShow) {
    fetch(`/bff/v1/positions/${shipTrackInternalReferenceNumberToShow}`)
        .then(response => response.json())
        .then(shipTrack => {
            setShipTrack(shipTrack)
        })
        .catch(error => {
            dispatch({type: 'SET_ERROR', payload: error});
        });
}