package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.GetAllProducerOrganizationMemberships
import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.SetProducerOrganizationMemberships
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ProducerOrganizationMembershipDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ProducerOrganizationMembershipDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/producer_organization_memberships")
@Tag(name = "APIs for Producer Organization (OP) memberships")
class ProducerOrganizationMembershipController(
    private val setProducerOrganizationMemberships: SetProducerOrganizationMemberships,
    private val getAllProducerOrganizationMemberships: GetAllProducerOrganizationMemberships,
) {
    @GetMapping("")
    @Operation(summary = "Get all Producer Organization memberships")
    fun getAll(): List<ProducerOrganizationMembershipDataOutput> =
        getAllProducerOrganizationMemberships
            .execute()
            .map { ProducerOrganizationMembershipDataOutput.fromProducerOrganizationMembership(it) }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping(value = [""], consumes = ["application/json"])
    @Operation(summary = "Set all Producer Organization memberships")
    fun set(
        @RequestBody
        producerOrganizationMembershipDataInput: List<ProducerOrganizationMembershipDataInput>,
    ) {
        val nextProducerOrganizationMemberships =
            producerOrganizationMembershipDataInput.map {
                it.toProducerOrganizationMembership()
            }

        setProducerOrganizationMemberships.execute(nextProducerOrganizationMemberships)
    }
}
