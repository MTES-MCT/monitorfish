package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.ZonedDateTime

@Entity
@Table(name = "authorized_organizational_units")
data class AuthorizedOrganizationalUnitEntity(
    @Id
    @Column(name = "organizational_unit", nullable = false)
    val organizationalUnit: String,
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    val createdAt: ZonedDateTime? = null,
)
