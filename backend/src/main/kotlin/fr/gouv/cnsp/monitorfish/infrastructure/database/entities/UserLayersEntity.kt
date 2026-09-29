package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.AdministrativeLayer
import fr.gouv.cnsp.monitorfish.domain.entities.user_layers.UserLayers
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.io.Serializable

@Entity
@Table(name = "user_layers")
data class UserLayersEntity(
    @Id
    @Column(name = "hashed_email")
    val hashedEmail: String,
    @Type(JsonBinaryType::class)
    @Column(name = "displayed_administrative_layers", columnDefinition = "jsonb")
    val displayedAdministrativeLayers: String,
    @Type(JsonBinaryType::class)
    @Column(name = "displayed_regulatory_zone_ids", columnDefinition = "jsonb")
    val displayedRegulatoryZoneIds: String,
    @Type(JsonBinaryType::class)
    @Column(name = "selected_regulatory_zone_ids", columnDefinition = "jsonb")
    val selectedRegulatoryZoneIds: String,
    @Column(name = "base_layer")
    val baseLayer: String?,
) : Serializable {
    fun toUserLayers(mapper: ObjectMapper): UserLayers =
        UserLayers(
            hashedEmail = hashedEmail,
            displayedAdministrativeLayers =
                mapper.readValue(
                    displayedAdministrativeLayers,
                    mapper.typeFactory.constructCollectionType(List::class.java, AdministrativeLayer::class.java),
                ),
            displayedRegulatoryZoneIds = readRegulatoryZoneIds(mapper, displayedRegulatoryZoneIds),
            selectedRegulatoryZoneIds = readRegulatoryZoneIds(mapper, selectedRegulatoryZoneIds),
            baseLayer = baseLayer,
        )

    companion object {
        private fun readRegulatoryZoneIds(
            mapper: ObjectMapper,
            regulatoryZoneIds: String,
        ): List<String> =
            mapper.readValue(
                regulatoryZoneIds,
                mapper.typeFactory.constructCollectionType(List::class.java, String::class.java),
            )

        fun fromUserLayers(
            mapper: ObjectMapper,
            userLayers: UserLayers,
        ): UserLayersEntity =
            UserLayersEntity(
                hashedEmail = userLayers.hashedEmail,
                displayedAdministrativeLayers = mapper.writeValueAsString(userLayers.displayedAdministrativeLayers),
                displayedRegulatoryZoneIds = mapper.writeValueAsString(userLayers.displayedRegulatoryZoneIds),
                selectedRegulatoryZoneIds = mapper.writeValueAsString(userLayers.selectedRegulatoryZoneIds),
                baseLayer = userLayers.baseLayer,
            )
    }
}
