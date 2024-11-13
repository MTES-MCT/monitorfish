package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ProducerOrganizationMembershipEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBProducerOrganizationMembership
import org.springframework.stereotype.Repository
import kotlin.jvm.optionals.getOrNull

@Repository
class JpaProducerOrganizationMembership(
    private val dbProducerOrganizationMembership: DBProducerOrganizationMembership,
) : ProducerOrganizationMembershipRepository {
    override fun findAll(): List<ProducerOrganizationMembership> {
        return dbProducerOrganizationMembership.findAll().map {
            it.toProducerOrganizationMembership()
        }
    }

    override fun saveAll(producerOrganizationMemberships: List<ProducerOrganizationMembership>) {
        dbProducerOrganizationMembership.saveAll(
            producerOrganizationMemberships
                .map { ProducerOrganizationMembershipEntity.fromProducerOrganizationMembership(it) },
        )
    }

    override fun findByInternalReferenceNumber(internalReferenceNumber: String): ProducerOrganizationMembership? {
        return dbProducerOrganizationMembership.findById(internalReferenceNumber).getOrNull()
            ?.toProducerOrganizationMembership()
    }
}
