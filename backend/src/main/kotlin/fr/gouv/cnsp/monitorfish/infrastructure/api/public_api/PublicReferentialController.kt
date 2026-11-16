package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api

import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.Referential
import fr.gouv.cnsp.monitorfish.infrastructure.api.referential.ReferentialInvalidation
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Called by the writers of the referentials (pipeline flows, backoffice), so that the new content gets a new version.
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Public APIs for referentials")
class PublicReferentialController(
    private val referentialInvalidation: ReferentialInvalidation,
) {
    @PutMapping("/infractions/invalidate")
    @Operation(summary = "Invalidate the infractions cache")
    fun invalidateInfractions() {
        referentialInvalidation.invalidate(Referential.INFRACTIONS)
    }

    @PutMapping("/regulations/invalidate")
    @Operation(summary = "Invalidate the regulatory zones catalogue cache")
    fun invalidateRegulations() {
        referentialInvalidation.invalidate(Referential.REGULATIONS)
    }

    @PutMapping("/species/invalidate")
    @Operation(summary = "Invalidate the species and species groups cache")
    fun invalidateSpecies() {
        referentialInvalidation.invalidate(Referential.SPECIES)
    }
}
