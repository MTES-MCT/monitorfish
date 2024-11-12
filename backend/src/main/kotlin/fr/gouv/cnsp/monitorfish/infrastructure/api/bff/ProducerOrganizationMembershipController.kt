package fr.gouv.cnsp.monitorfish.infrastructure.api.bff

import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.GetAllProducerOrganizationMemberships
import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.GetProducerOrganizationMembershipByInternalReferenceNumber
import fr.gouv.cnsp.monitorfish.domain.use_cases.producer_organization_membership.SetProducerOrganizationMemberships
import fr.gouv.cnsp.monitorfish.infrastructure.api.input.ProducerOrganizationMembershipDataInput
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.ProducerOrganizationMembershipDataOutput
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.websocket.server.PathParam
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/bff/v1/producer_organization_memberships")
@Tag(name = "APIs for Producer Organization (OP) memberships")
class ProducerOrganizationMembershipController(
    private val setProducerOrganizationMemberships: SetProducerOrganizationMemberships,
    private val getAllProducerOrganizationMemberships: GetAllProducerOrganizationMemberships,
    private val getProducerOrganizationMembershipByInternalReferenceNumber:
        GetProducerOrganizationMembershipByInternalReferenceNumber,
) {
    @GetMapping("")
    @Operation(summary = "Get all Producer Organization memberships")
    fun getAll(): List<ProducerOrganizationMembershipDataOutput> {
        return getAllProducerOrganizationMemberships.execute()
            .map { ProducerOrganizationMembershipDataOutput.fromProducerOrganizationMembership(it) }
    }

    @GetMapping("/{internalReferenceNumber}")
    @Operation(summary = "Get all Producer Organization memberships")
    fun get(
        @PathParam("Vessel CFR `internalReferenceNumber`")
        @PathVariable(name = "internalReferenceNumber")
        internalReferenceNumber: String,
    ): ProducerOrganizationMembershipDataOutput {
        val producerOrganizationMembership =
            getProducerOrganizationMembershipByInternalReferenceNumber.execute(
                internalReferenceNumber,
            )

        return ProducerOrganizationMembershipDataOutput.fromProducerOrganizationMembership(
            producerOrganizationMembership,
        )
    }

    @PostMapping("/")
    @Operation(summary = "Set all Producer Organization memberships")
    fun set(
        @RequestBody
        producerOrganizationMembershipDataInput: List<ProducerOrganizationMembershipDataInput>,
    ): List<ProducerOrganizationMembershipDataOutput> {
        val nextProducerOrganizationMemberships =
            producerOrganizationMembershipDataInput.map {
                it.toProducerOrganizationMembership()
            }

        val producerOrganizationMemberships =
            setProducerOrganizationMemberships.execute(
                nextProducerOrganizationMemberships,
            )

        return producerOrganizationMemberships.map {
            ProducerOrganizationMembershipDataOutput.fromProducerOrganizationMembership(it)
        }
    }
}
