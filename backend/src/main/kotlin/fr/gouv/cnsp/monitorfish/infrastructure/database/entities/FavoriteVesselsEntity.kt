package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels.FavoriteVessels
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.io.Serializable

@Entity
@Table(name = "favorite_vessels")
data class FavoriteVesselsEntity(
    @Id
    @Column(name = "hashed_email")
    val hashedEmail: String,
    @Type(JsonBinaryType::class)
    @Column(name = "vessels", columnDefinition = "jsonb")
    val vessels: String,
) : Serializable {
    fun toFavoriteVessels(mapper: ObjectMapper): FavoriteVessels =
        FavoriteVessels(
            hashedEmail = hashedEmail,
            vessels =
                mapper.readValue(
                    vessels,
                    mapper.typeFactory
                        .constructCollectionType(List::class.java, VesselIdentity::class.java),
                ),
        )

    companion object {
        fun fromFavoriteVessels(
            mapper: ObjectMapper,
            favoriteVessels: FavoriteVessels,
        ): FavoriteVesselsEntity =
            FavoriteVesselsEntity(
                hashedEmail = favoriteVessels.hashedEmail,
                vessels = mapper.writeValueAsString(favoriteVessels.vessels),
            )
    }
}
