package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "ports")
data class PortEntity(
    @Column(name = "country_code_iso2")
    val countryCode: String? = null,
    @Column(name = "region")
    val region: String? = null,
    @Id
    @Column(name = "locode")
    val locode: String,
    @Column(name = "port_name")
    val portName: String,
    @Column(name = "facade", columnDefinition = "facade")
    val facade: String? = null,
    @Column(name = "latitude")
    val latitude: Double? = null,
    @Column(name = "longitude")
    val longitude: Double? = null,
    @Column(name = "is_active")
    val isActive: Boolean? = null,
    @Column(name = "fao_areas")
    val faoAreas: List<String>? = listOf(),
) {
    fun toPort() =
        Port(
            locode = locode,
            countryCode = countryCode,
            name = portName,
            facade = facade?.let { Seafront.from(it).toString() },
            faoAreas = faoAreas ?: listOf(),
            latitude = latitude,
            longitude = longitude,
            region = region,
        )
}
