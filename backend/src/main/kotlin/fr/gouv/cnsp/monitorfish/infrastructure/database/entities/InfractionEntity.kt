package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.controls.Infraction
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "infractions")
data class InfractionEntity(
        @Id
        @Column(name = "id")
        var id: Int,
        @Column(name = "natinf_code")
        var natinfCode: String? = null,
        @Column(name = "regulation")
        var regulation: String? = null,
        @Column(name = "infraction_category")
        var infractionCategory: String? = null,
        @Column(name = "infraction")
        var infraction: String? = null) {

    fun toInfraction() = Infraction(
            id = id,
            natinfCode = natinfCode,
            regulation = regulation,
            infractionCategory = infractionCategory,
            infraction = infraction)
}
