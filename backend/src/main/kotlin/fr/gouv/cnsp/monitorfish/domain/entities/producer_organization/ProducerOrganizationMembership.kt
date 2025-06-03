package fr.gouv.cnsp.monitorfish.domain.entities.producer_organization

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

data class ProducerOrganizationMembership(
    /** CFR (Common Fleet Register Number). */
    val internalReferenceNumber: String,
    val joiningDate: String,
    val organizationName: String,
) {
    fun isInGroup(vesselGroup: VesselGroupBase): Boolean {
        if (vesselGroup !is DynamicVesselGroup) return false

        val filters = vesselGroup.filters

        val hasProducerOrganizationsMatch =
            filters.producerOrganizations.isEmpty() ||
                (filters.producerOrganizations.contains(organizationName))

        return hasProducerOrganizationsMatch
    }
}
