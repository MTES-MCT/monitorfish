package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoTypeRule
import jakarta.persistence.*

@Entity
@Table(name = "pno_type_rules")
data class PnoTypeRuleEntity(
    @Id
    @Column(name = "id", unique = true)
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pno_type_id", nullable = false)
    val pnoType: PnoTypeEntity,

    @Column(name = "species", nullable = false, columnDefinition = "VARCHAR[]")
    val species: List<String> = listOf(),

    @Column(name = "fao_areas", nullable = false, columnDefinition = "VARCHAR[]")
    val faoAreas: List<String> = listOf(),

    @Column(name = "cgpm_areas", nullable = false, columnDefinition = "VARCHAR[]")
    val cgpmAreas: List<String> = listOf(),

    @Column(name = "gears", nullable = false, columnDefinition = "VARCHAR[]")
    val gears: List<String> = listOf(),

    @Column(name = "flag_states", nullable = false, columnDefinition = "VARCHAR[]")
    val flagStates: List<String> = listOf(),

    @Column(name = "minimum_quantity_kg", nullable = false)
    val minimumQuantityKg: Double = 0.0,
) {

    fun toPnoTypeRule() = PnoTypeRule(
        id = id,
        species = species,
        faoAreas = faoAreas,
        cgpmAreas = cgpmAreas,
        gears = gears,
        flagStates = flagStates,
        minimumQuantityKg = minimumQuantityKg,
    )
}
