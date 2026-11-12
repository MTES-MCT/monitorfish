package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

/**
 * The active vessels changes since a previous state of the client (see `ActiveVesselsChangeTracker`).
 *
 * @property asOf State to send back to get the next changes
 * @property isFull `vessels` contains all the active vessels (no or outdated previous state)
 * @property vessels Vessels added, or of which another property than the position changed
 * @property positions Vessels of which only the position changed
 * @property activeVesselsCount Number of active vessels, to check the state of the client
 * @property fingerprint Fingerprint of the feature ids of the active vessels, to check the state of the client
 * @property vesselGroupsByVesselFeatureId Groups of the user of all the vessels in a group (when not `isFull`)
 */
data class ActiveVesselsChanges(
    val asOf: String,
    val isFull: Boolean,
    val vessels: List<EnrichedActiveVessel>,
    val positions: List<EnrichedActiveVessel>,
    val removedVesselFeatureIds: List<String>,
    val activeVesselsCount: Int,
    val fingerprint: Long,
    val vesselGroupsByVesselFeatureId: Map<String, List<VesselGroupBase>> = mapOf(),
)
