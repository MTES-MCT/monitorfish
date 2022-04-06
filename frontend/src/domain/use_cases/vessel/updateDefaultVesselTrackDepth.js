import { setDefaultVesselTrackDepth } from '../../shared_slices/Map'
import updateVesselTracks from './updateVesselTracks'

/**
 * Update the global vessel track Depth and re-render the rendered vessels tracks
 * @function updateDefaultVesselTrackDepth
 * @param {VesselTrackDepth} trackDepth - One of the VesselTrackDepth string enum
 */
const updateDefaultVesselTrackDepth = trackDepth => dispatch => {
  dispatch(setDefaultVesselTrackDepth(trackDepth))
  dispatch(updateVesselTracks())
}

export default updateDefaultVesselTrackDepth
