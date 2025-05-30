package fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.ProducerOrganizationMembershipRepository

@UseCase
class GetDistinctProducerOrganizations(
    private val producerOrganizationMembershipRepository: ProducerOrganizationMembershipRepository,
) {
    fun execute(): List<String> =
        producerOrganizationMembershipRepository
            .findAll()
            .map { it.organizationName }
            .distinct()
}
