package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import jakarta.persistence.*

@Entity
@Table(name = "isr")
data class IsrEntity(
    @Id
    val code: String,
    val name: String,
    val description: String? = null,
)
