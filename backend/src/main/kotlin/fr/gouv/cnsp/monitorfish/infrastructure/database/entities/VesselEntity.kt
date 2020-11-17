package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.Vessel
import java.time.ZonedDateTime
import javax.persistence.*

@Entity
@Table(name = "vessels", indexes = [
        Index(columnList = "id", unique = true),
        Index(columnList = "external_reference_number", unique = false),
        Index(columnList = "internal_reference_number", unique = false),
        Index(columnList = "mmsi", unique = false),
        Index(columnList = "ircs", unique = false)])
data class VesselEntity(
        @Id
        @SequenceGenerator(name = "vessel_id_seq", sequenceName = "vessel_id_seq", allocationSize = 1)
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vessel_id_seq")
        @Column(name = "id")
        val id: Int? = null,

        @Column(name = "internal_reference_number")
        val internalReferenceNumber: String? = null,
        @Column(name = "mmsi")
        val MMSI: String? = null,
        @Column(name = "ircs")
        val IRCS: String? = null,
        @Column(name = "external_reference_number")
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
        @Column(name = "declared_fishing_gear_main")
        val declaredFishingGearMain: String? = null,
        @Column(name = "declared_fishing_gear_secondary")
        val declaredFishingGearSecondary: String? = null,
        @Column(name = "declared_fishing_gear_third")
        val declaredFishingGearThird: String? = null,
        @Column(name = "weight_authorized_on_deck")
        val weightAuthorizedOnDeck: Double? = null,
        @Column(name = "pinger")
        val pinger: Boolean? = null,
        @Column(name = "navigation_licence_expiration_date")
        val navigationLicenceExpirationDate: ZonedDateTime? = null,

        @Column(name = "shipowner_name")
        val shipownerName: String? = null,
        @Column(name = "shipowner_telephone_number")
        val shipownerTelephoneNumber: String? = null,
        @Column(name = "shipowner_email")
        val shipownerEmail: String? = null,

        @Column(name = "fisher_name")
        val fisherName: String? = null,
        @Column(name = "fisher_telephone_number")
        val fisherTelephoneNumber: String? = null,
        @Column(name = "fisher_email")
        val fisherEmail: String? = null) {

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
            declaredFishingGearMain = declaredFishingGearMain,
            declaredFishingGearSecondary = declaredFishingGearSecondary,
            declaredFishingGearThird = declaredFishingGearThird,
            weightAuthorizedOnDeck = weightAuthorizedOnDeck,
            pinger = pinger,
            navigationLicenceExpirationDate = navigationLicenceExpirationDate,
            shipownerName = shipownerName,
            shipownerTelephoneNumber = shipownerTelephoneNumber,
            shipownerEmail = shipownerEmail,
            fisherName = fisherName,
            fisherTelephoneNumber = fisherTelephoneNumber,
            fisherEmail = fisherEmail
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
                                declaredFishingGearMain = vessel.declaredFishingGearMain,
                                declaredFishingGearSecondary = vessel.declaredFishingGearSecondary,
                                declaredFishingGearThird = vessel.declaredFishingGearThird,
                                weightAuthorizedOnDeck = vessel.weightAuthorizedOnDeck,
                                pinger = vessel.pinger,
                                navigationLicenceExpirationDate = vessel.navigationLicenceExpirationDate,
                                shipownerName = vessel.shipownerName,
                                shipownerTelephoneNumber = vessel.shipownerTelephoneNumber,
                                shipownerEmail = vessel.shipownerEmail,
                                fisherName = vessel.fisherName,
                                fisherTelephoneNumber = vessel.fisherTelephoneNumber,
                                fisherEmail = vessel.fisherEmail,
                        )
                }
        }
}
