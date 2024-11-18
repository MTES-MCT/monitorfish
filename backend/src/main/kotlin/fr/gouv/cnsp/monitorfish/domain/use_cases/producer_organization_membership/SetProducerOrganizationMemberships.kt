package fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository

@UseCase
class SetProducerOrganizationMemberships(
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository,
) {
    fun execute(producerOrganizationMemberships: List<ProducerOrganizationMembership>) {
        producerOrganizationMembershipRepository.saveAll(producerOrganizationMemberships)
    }
}
