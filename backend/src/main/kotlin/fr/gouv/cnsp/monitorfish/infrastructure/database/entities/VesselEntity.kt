package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import com.vladmihalcea.hibernate.type.array.ListArrayType
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "vessels", indexes = [
        Index(columnList = "id", unique = true),
        Index(columnList = "cfr", unique = false),
        Index(columnList = "external_immatriculation", unique = false),
        Index(columnList = "ircs", unique = false)])
@TypeDef(
        name = "list-array",
        typeClass = ListArrayType::class)
data class VesselEntity(
        @Id
        @Column(name = "id")
        val id: Int? = null,
        @Column(name = "cfr")
        val internalReferenceNumber: String? = null,
        @Column(name = "mmsi")
        val MMSI: String? = null,
        @Column(name = "imo")
        val IMO: String? = null,
        @Column(name = "ircs")
        val IRCS: String? = null,
        @Column(name = "external_immatriculation")
        val externalReferenceNumber: String? = null,
        @Column(name = "vessel_name")
        val vesselName: String? = null,
        @Column(name = "flag_state")
        @Enumerated(EnumType.STRING)
        val flagState: CountryCode? = null,

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
        @Type(type = "list-array")
        val declaredFishingGears:  List<String>? = null,
        @Column(name = "weight_authorized_on_deck")
        val weightAuthorizedOnDeck: Double? = null,
        @Column(name = "pinger")
        val pinger: Boolean? = null,
        @Column(name = "nav_licence_expiration_date")
        val navigationLicenceExpirationDate: Date? = null,

        @Column(name = "shipowner_name")
        val shipownerName: String? = null,
        @Column(name = "shipowner_phones", columnDefinition = "varchar(100)[]")
        @Type(type = "list-array")
        val shipownerPhones:  List<String>? = null,
        @Column(name = "shipowner_emails", columnDefinition = "varchar(100)[]")
        @Type(type = "list-array")
        val shipownerEmails:  List<String>? = null,

        @Column(name = "fisher_name")
        val fisherName: String? = null,
        @Column(name = "fisher_phones", columnDefinition = "varchar(100)[]")
        @Type(type = "list-array")
        val fisherPhones: List<String>? = null,
        @Column(name = "fisher_emails", columnDefinition = "varchar(100)[]")
        @Type(type = "list-array")
        val fisherEmails: List<String>? = null) {

    fun toVessel() = Vessel(
            internalReferenceNumber = internalReferenceNumber,
            IRCS = IRCS,
            MMSI = MMSI,
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
            weightAuthorizedOnDeck = weightAuthorizedOnDeck,
            pinger = pinger,
            navigationLicenceExpirationDate = navigationLicenceExpirationDate,
            shipownerName = shipownerName,
            shipownerPhones = shipownerPhones,
            shipownerEmails = shipownerEmails,
            fisherName = fisherName,
            fisherPhones = fisherPhones,
            fisherEmails = fisherEmails
    )

        companion object {
                fun fromVessel(vessel: Vessel): VesselEntity {
                        return VesselEntity(
                                internalReferenceNumber = vessel.internalReferenceNumber,
                                IRCS = vessel.IRCS,
                                MMSI = vessel.MMSI,
                                externalReferenceNumber = vessel.externalReferenceNumber,
                                vesselName = vessel.vesselName,
                                flagState = vessel.flagState,
                                width = vessel.width,
                                length = vessel.length,
                                district = vessel.district,
                                districtCode = vessel.districtCode,
                                gauge = vessel.gauge,
                                registryPort = vessel.registryPort,
                                power = vessel.power,
                                vesselType = vessel.vesselType,
                                sailingCategory = vessel.sailingCategory,
                                sailingType = vessel.sailingType,
                                declaredFishingGears = vessel.declaredFishingGears,
                                weightAuthorizedOnDeck = vessel.weightAuthorizedOnDeck,
                                pinger = vessel.pinger,
                                navigationLicenceExpirationDate = vessel.navigationLicenceExpirationDate,
                                shipownerName = vessel.shipownerName,
                                shipownerPhones = vessel.shipownerPhones,
                                shipownerEmails = vessel.shipownerEmails,
                                fisherName = vessel.fisherName,
                                fisherPhones = vessel.fisherPhones,
                                fisherEmails = vessel.fisherEmails,
                        )
                }
        }
}
