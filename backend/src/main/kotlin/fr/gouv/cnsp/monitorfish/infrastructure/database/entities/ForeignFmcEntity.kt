package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.vladmihalcea.hibernate.type.array.ListArrayType
import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.ForeignFMC
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "foreign_fmcs")
@TypeDef(
    name = "list-array",
    typeClass = ListArrayType::class
)
data class ForeignFmcEntity(
    @Id
    @Column(name = "country_code_iso3")
    var countryCodeIso3: String,
    @Column(name = "country_name")
    var countryName: String,
    @Column(name = "email_addresses", columnDefinition = "varchar[]")
    @Type(type = "list-array")
    var emailAddresses: List<String>? = null
) {

    fun toForeignFMC() = ForeignFMC(
        countryCodeIso3 = countryCodeIso3,
        countryName = countryName,
        emailAddresses = emailAddresses
    )
}
