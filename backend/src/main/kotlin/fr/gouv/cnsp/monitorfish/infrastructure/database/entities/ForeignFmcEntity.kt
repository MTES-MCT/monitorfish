package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.ForeignFMC
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "foreign_fmcs")
data class ForeignFmcEntity(
    @Id
    @Column(name = "country_code_iso3")
    var countryCodeIso3: String,
    @Column(name = "country_name")
    var countryName: String,
    @Column(name = "email_addresses", columnDefinition = "varchar[]")
    var emailAddresses: List<String>? = null,
) {

    fun toForeignFMC() = ForeignFMC(
        countryCodeIso3 = countryCodeIso3,
        countryName = countryName,
        emailAddresses = emailAddresses,
    )
}
