import focusOnVesselSearch, {focusState} from "./focusOnVesselSearch";

describe('focusOnVesselSearch', () => {
    it('Should not focus When click outside and sidebar is open', async () => {
        // Given
        const dispatch = jest.fn()
        const getState = () => ({
            vessel: {
                vesselSidebarIsOpen: true
            }
        })

        // When
        await focusOnVesselSearch()(dispatch, getState)

        // Then
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith(
            {
                type: "vessel/setFocusOnVesselSearch",
                payload: false
            })
    });

    it('Should focus When click on the vessel name', async () => {
        // Given
        const dispatch = jest.fn()
        const getState = () => ({
            vessel: {
                vesselSidebarIsOpen: true
            }
        })

        // When
        await focusOnVesselSearch(focusState.CLICK_VESSEL_TITLE)(dispatch, getState)

        // Then
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith(
            {
                type: "vessel/setFocusOnVesselSearch",
                payload: true
            })
    });

    it('Should not focus When click on the vessel search item', async () => {
        // Given
        const dispatch = jest.fn()
        const getState = () => ({
            vessel: {
                vesselSidebarIsOpen: true
            }
        })

        // When
        await focusOnVesselSearch(focusState.CLICK_VESSEL_SEARCH_RESULT)(dispatch, getState)

        // Then
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith(
            {
                type: "vessel/setFocusOnVesselSearch",
                payload: false
            })
    });

    it('Should return immediately When it is an update', async () => {
        // Given
        const dispatch = jest.fn()
        const getState = () => ({
            vessel: {
                vesselSidebarIsOpen: true
            }
        })

        // When
        await focusOnVesselSearch(null, true)(dispatch, getState)

        // Then
        expect(dispatch).toHaveBeenCalledTimes(0)
    });
});
