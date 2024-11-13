package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership

interface ProducerOrganizationMembershipRepository {
    fun findAll(): List<ProducerOrganizationMembership>

    fun saveAll(producerOrganizationMemberships: List<ProducerOrganizationMembership>)

    fun findByInternalReferenceNumber(internalReferenceNumber: String): ProducerOrganizationMembership?
}
