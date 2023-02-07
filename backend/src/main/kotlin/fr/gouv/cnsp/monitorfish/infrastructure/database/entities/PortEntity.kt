package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

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
    @Column(name = "latitude")
    val latitude: Double? = null,
    @Column(name = "longitude")
    val longitude: Double? = null,
) {

    fun toPort() = Port(
        locode = locode,
        name = portName,
    )
}
