package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionActionType
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import java.time.ZonedDateTime
import java.util.*

@Serializable
data class EnvMissionActionDataResponse(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID,
    val actionStartDateTimeUtc: String,
    val actionType: EnvMissionActionType,
) {
    fun toEnvMissionAction() = EnvMissionAction(
        id = id,
        actionStartDateTimeUtc = ZonedDateTime.parse(actionStartDateTimeUtc),
        actionType = actionType,
    )
}

object UUIDSerializer : KSerializer<UUID> {
    override val descriptor = PrimitiveSerialDescriptor("UUID", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): UUID {
        return UUID.fromString(decoder.decodeString())
    }

    override fun serialize(encoder: Encoder, value: UUID) {
        encoder.encodeString(value.toString())
    }
}
