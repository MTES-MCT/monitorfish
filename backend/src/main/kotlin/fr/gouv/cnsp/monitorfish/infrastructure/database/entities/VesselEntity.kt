package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.converters.CountryCodeConverter
import jakarta.persistence.*
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
    @Convert(converter = CountryCodeConverter::class)
    val flagState: CountryCode,
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
    val declaredFishingGears: List<String>,
    @Column(name = "nav_licence_expiration_date", columnDefinition = "date")
    val navigationLicenceExpirationDate: Date? = null,
    @Column(name = "nav_licence_extension_date", columnDefinition = "date")
    val navigationLicenceExtensionDate: Date? = null,
    @Column(name = "nav_licence_status")
    val navigationLicenceStatus: String? = null,
    @Column(name = "operator_name")
    val operatorName: String? = null,
    @Column(name = "operator_phones", columnDefinition = "varchar(100)[]")
    val operatorPhones: List<String>? = null,
    @Column(name = "operator_email")
    val operatorEmail: String? = null,
    @Column(name = "proprietor_name")
    val proprietorName: String? = null,
    @Column(name = "proprietor_phones", columnDefinition = "varchar(100)[]")
    val proprietorPhones: List<String>? = null,
    @Column(name = "proprietor_emails", columnDefinition = "varchar(100)[]")
    val proprietorEmails: List<String>? = null,
    @Column(name = "vessel_phones", columnDefinition = "varchar(100)[]")
    val vesselPhones: List<String>? = null,
    @Column(name = "vessel_emails", columnDefinition = "varchar(100)[]")
    val vesselEmails: List<String>? = null,
    @Column(name = "under_charter")
    val underCharter: Boolean? = null,
    /** Logbook */
    @Column(name = "logbook_equipment_status")
    val logbookEquipmentStatus: String? = null,
    @Column(name = "has_esacapt")
    val hasLogbookEsacapt: Boolean,
) {
    fun toVessel() =
        Vessel(
            id = id,
            internalReferenceNumber = internalReferenceNumber,
            ircs = ircs,
            mmsi = mmsi,
            externalReferenceNumber = externalReferenceNumber,
            vesselName = vesselName,
            flagState = flagState,
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
            navigationLicenceExtensionDate = navigationLicenceExtensionDate,
            navigationLicenceStatus = navigationLicenceStatus,
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
            logbookEquipmentStatus = logbookEquipmentStatus,
            hasLogbookEsacapt = hasLogbookEsacapt,
        )

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(VesselEntity::class.java)
    }
}
