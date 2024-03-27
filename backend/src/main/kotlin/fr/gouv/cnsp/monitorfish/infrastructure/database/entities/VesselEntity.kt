package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*

@Entity
@Table(
    name = "vessels",
    indexes = [
        Index(columnList = "id", unique = true),
        Index(columnList = "cfr", unique = false),
        Index(columnList = "external_immatriculation", unique = false),
        Index(columnList = "ircs", unique = false),
    ],
)
data class VesselEntity(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "cfr")
    val internalReferenceNumber: String? = null,
    @Column(name = "mmsi")
    val mmsi: String? = null,
    @Column(name = "imo")
    val imo: String? = null,
    @Column(name = "ircs")
    val ircs: String? = null,
    @Column(name = "external_immatriculation")
    val externalReferenceNumber: String? = null,
    @Column(name = "vessel_name")
    val vesselName: String? = null,
    // ISO Alpha-2 country code
    @Column(name = "flag_state")
    val flagState: String? = null,
    @Column(name = "width")
    val width: Double? = null,
    @Column(name = "length")
    val length: Double? = null,
    @Column(name = "district")
    val district: String? = null,
    @Column(name = "district_code")
    val districtCode: String? = null,
    @Column(name = "gauge")
    val gauge: Double? = null,
    @Column(name = "registry_port")
    val registryPort: String? = null,
    @Column(name = "power")
    val power: Double? = null,
    @Column(name = "vessel_type")
    val vesselType: String? = null,
    @Column(name = "sailing_category")
    val sailingCategory: String? = null,
    @Column(name = "sailing_type")
    val sailingType: String? = null,
    @Column(name = "declared_fishing_gears", columnDefinition = "varchar(100)[]")
    @Type(ListArrayType::class)
    val declaredFishingGears: List<String>? = null,
    @Column(name = "nav_licence_expiration_date", columnDefinition = "date")
    val navigationLicenceExpirationDate: Date? = null,
    @Column(name = "operator_name")
    val operatorName: String? = null,
    @Column(name = "operator_phones", columnDefinition = "varchar(100)[]")
    @Type(ListArrayType::class)
    val operatorPhones: List<String>? = null,
    @Column(name = "operator_email")
    val operatorEmail: String? = null,
    @Column(name = "proprietor_name")
    val proprietorName: String? = null,
    @Column(name = "proprietor_phones", columnDefinition = "varchar(100)[]")
    @Type(ListArrayType::class)
    val proprietorPhones: List<String>? = null,
    @Column(name = "proprietor_emails", columnDefinition = "varchar(100)[]")
    @Type(ListArrayType::class)
    val proprietorEmails: List<String>? = null,
    @Column(name = "vessel_phones", columnDefinition = "varchar(100)[]")
    @Type(ListArrayType::class)
    val vesselPhones: List<String>? = null,
    @Column(name = "vessel_emails", columnDefinition = "varchar(100)[]")
    @Type(ListArrayType::class)
    val vesselEmails: List<String>? = null,
    @Column(name = "under_charter")
    val underCharter: Boolean? = null,
) {
    fun toVessel() =
        Vessel(
            id = id,
            internalReferenceNumber = internalReferenceNumber,
            ircs = ircs,
            mmsi = mmsi,
            externalReferenceNumber = externalReferenceNumber,
            vesselName = vesselName,
            flagState = flagState?.let {
                try {
                    CountryCode.valueOf(flagState)
                } catch (e: IllegalArgumentException) {
                    logger.warn(e.message)
                    CountryCode.UNDEFINED
                }
            } ?: CountryCode.UNDEFINED,
            width = width,
            length = length,
            district = district,
            districtCode = districtCode,
            gauge = gauge,
            registryPort = registryPort,
            power = power,
            vesselType = vesselType,
            sailingCategory = sailingCategory,
            sailingType = sailingType,
            declaredFishingGears = declaredFishingGears,
            navigationLicenceExpirationDate = navigationLicenceExpirationDate,
            operatorName = operatorName,
            operatorPhones = operatorPhones,
            operatorEmail = operatorEmail,
            proprietorName = proprietorName,
            proprietorPhones = proprietorPhones,
            proprietorEmails = proprietorEmails,
            vesselPhones = vesselPhones,
            vesselEmails = vesselEmails,
            underCharter = underCharter,
        )

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(VesselEntity::class.java)
    }
}
