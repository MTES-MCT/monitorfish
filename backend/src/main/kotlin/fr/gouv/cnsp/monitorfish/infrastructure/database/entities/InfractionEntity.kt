package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.InfractionCategory
import jakarta.persistence.*

@Entity
@Table(name = "infractions")
data class InfractionEntity(
    @Id
    @Column(name = "natinf_code")
    var natinfCode: String,
    @Column(name = "regulation")
    var regulation: String? = null,
    @Column(name = "infraction_category")
    var infractionCategory: String? = null,
    @Column(name = "infraction")
    var infraction: String? = null,
) {

    fun toInfraction() = Infraction(
        natinfCode = natinfCode,
        regulation = regulation,
        infractionCategory = infractionCategory?.let { category -> InfractionCategory.values().firstOrNull {
            it.value == category
        } },
        infraction = infraction,
    )
}
