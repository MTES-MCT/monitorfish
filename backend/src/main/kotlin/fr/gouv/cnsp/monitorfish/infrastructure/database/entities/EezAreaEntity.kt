package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "eez_areas")
data class EezAreaEntity(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "\"SOVEREIGN1\"")
    val sovereign1: String?,
)
