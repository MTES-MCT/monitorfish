package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "risk_elements")
data class RiskElementEntity(
    @Id
    @Column(name = "code")
    val code: String,
    @Column(name = "name", nullable = false)
    val name: String,
    @Column(name = "threat_characterization_id", nullable = false)
    val threatCharacterizationId: Int,
)
