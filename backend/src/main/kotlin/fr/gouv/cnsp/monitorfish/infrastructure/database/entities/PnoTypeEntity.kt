package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PnoType
import jakarta.persistence.*

@Entity
@Table(name = "pno_types")
data class PnoTypeEntity(
    @Id
    @Column(name = "id", unique = true)
    val id: Int = 0,
    @Column(name = "name", nullable = false)
    val name: String,
    @Column(name = "minimum_notification_period", nullable = false)
    val minimumNotificationPeriod: Double = -1.0,
    @Column(name = "has_designated_ports", nullable = false)
    val hasDesignatedPorts: Boolean = false,
    @OneToMany(mappedBy = "pnoType", cascade = [CascadeType.ALL], orphanRemoval = true)
    val pnoTypeRules: List<PnoTypeRuleEntity> = listOf(),
) {
    fun toPnoType() =
        PnoType(
            id = id,
            name = name,
            minimumNotificationPeriod = minimumNotificationPeriod,
            hasDesignatedPorts = hasDesignatedPorts,
            pnoTypeRules = pnoTypeRules.map { it.toPnoTypeRule() },
        )
}
