package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException

interface ProducerOrganizationMembershipRepository {
    fun findAll(): List<ProducerOrganizationMembership>

    fun saveAll(producerOrganizationMemberships: List<ProducerOrganizationMembership>)

    @Throws(CouldNotFindException::class)
    fun findByInternalReferenceNumber(internalReferenceNumber: String): ProducerOrganizationMembership
}
