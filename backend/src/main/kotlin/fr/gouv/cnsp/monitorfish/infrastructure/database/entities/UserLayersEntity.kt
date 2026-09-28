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
    @Column(name = "administrative_layers", columnDefinition = "jsonb")
    val administrativeLayers: String,
    @Type(JsonBinaryType::class)
    @Column(name = "showed_regulatory_zone_ids", columnDefinition = "jsonb")
    val showedRegulatoryZoneIds: String,
    @Type(JsonBinaryType::class)
    @Column(name = "selected_regulatory_zone_ids", columnDefinition = "jsonb")
    val selectedRegulatoryZoneIds: String,
    @Column(name = "base_layer")
    val baseLayer: String?,
) : Serializable {
    fun toUserLayers(mapper: ObjectMapper): UserLayers =
        UserLayers(
            hashedEmail = hashedEmail,
            administrativeLayers =
                mapper.readValue(
                    administrativeLayers,
                    mapper.typeFactory.constructCollectionType(List::class.java, AdministrativeLayer::class.java),
                ),
            showedRegulatoryZoneIds = readRegulatoryZoneIds(mapper, showedRegulatoryZoneIds),
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
                administrativeLayers = mapper.writeValueAsString(userLayers.administrativeLayers),
                showedRegulatoryZoneIds = mapper.writeValueAsString(userLayers.showedRegulatoryZoneIds),
                selectedRegulatoryZoneIds = mapper.writeValueAsString(userLayers.selectedRegulatoryZoneIds),
                baseLayer = userLayers.baseLayer,
            )
    }
}
