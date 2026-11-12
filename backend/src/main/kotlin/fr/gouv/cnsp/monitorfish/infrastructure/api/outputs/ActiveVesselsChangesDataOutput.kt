package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonInclude
import fr.gouv.cnsp.monitorfish.domain.entities.coordinates.transformCoordinatesToOpenlayersProjection
import fr.gouv.cnsp.monitorfish.domain.entities.position.PositionType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselsChanges
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import java.time.Duration
import java.time.ZonedDateTime

data class ActiveVesselsChangesDataOutput(
    val asOf: String,
    val isFull: Boolean,
    val vessels: List<ActiveVesselBaseDataOutput>,
    val positions: List<ActiveVesselPositionDataOutput>,
    val removedVesselFeatureIds: List<String>,
    /** Groups referenced by `vesselGroupIdsByVesselFeatureId` */
    val vesselGroups: List<LastPositionVesselGroupDataOutput>,
    /** Groups of the user of all the vessels in a group (empty when `isFull`: the vessels contain their groups) */
    val vesselGroupIdsByVesselFeatureId: Map<String, List<Int>>,
    val activeVesselsCount: Int,
    val fingerprint: Long,
) {
    companion object {
        fun fromActiveVesselsChanges(changes: ActiveVesselsChanges): ActiveVesselsChangesDataOutput {
            val vesselGroups =
                changes.vesselGroupsByVesselFeatureId.values
                    .flatten()
                    .distinctBy { it.id }
                    .map {
                        LastPositionVesselGroupDataOutput(
                            id = it.id!!,
                            color = it.color,
                            name = it.name,
                            isPriorityGroup = it.isPriorityGroup,
                        )
                    }

            return ActiveVesselsChangesDataOutput(
                asOf = changes.asOf,
                isFull = changes.isFull,
                vessels =
                    changes.vessels.mapIndexed { index, vessel ->
                        ActiveVesselBaseDataOutput.fromEnrichedActiveVessel(
                            enrichedActiveVessel = vessel,
                            index = index,
                        )
                    },
                positions =
                    changes.positions.mapNotNull {
                        ActiveVesselPositionDataOutput.fromEnrichedActiveVessel(
                            it,
                        )
                    },
                removedVesselFeatureIds = changes.removedVesselFeatureIds,
                vesselGroups = vesselGroups,
                vesselGroupIdsByVesselFeatureId =
                    changes.vesselGroupsByVesselFeatureId.mapValues { (_, groups) -> groups.mapNotNull { it.id } },
                activeVesselsCount = changes.activeVesselsCount,
                fingerprint = changes.fingerprint,
            )
        }
    }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ActiveVesselPositionDataOutput(
    val vesselFeatureId: String,
    val positionType: PositionType,
    val latitude: Double,
    val longitude: Double,
    val estimatedCurrentLatitude: Double? = null,
    val estimatedCurrentLongitude: Double? = null,
    val speed: Double? = null,
    val course: Double? = null,
    val dateTime: ZonedDateTime,
    val emissionPeriod: Duration? = null,
    val isAtPort: Boolean,
    val coordinates: List<Double>?,
    val lastPositionSentAt: Long,
) {
    companion object {
        fun fromEnrichedActiveVessel(enrichedActiveVessel: EnrichedActiveVessel): ActiveVesselPositionDataOutput? =
            enrichedActiveVessel.lastPosition?.let { lastPosition ->
                ActiveVesselPositionDataOutput(
                    vesselFeatureId = enrichedActiveVessel.getFeatureId(),
                    positionType = lastPosition.positionType,
                    latitude = lastPosition.latitude,
                    longitude = lastPosition.longitude,
                    estimatedCurrentLatitude = lastPosition.estimatedCurrentLatitude,
                    estimatedCurrentLongitude = lastPosition.estimatedCurrentLongitude,
                    speed = lastPosition.speed,
                    course = lastPosition.course,
                    dateTime = lastPosition.dateTime,
                    emissionPeriod = lastPosition.emissionPeriod,
                    isAtPort = lastPosition.isAtPort,
                    coordinates =
                        transformCoordinatesToOpenlayersProjection(
                            longitude = lastPosition.longitude,
                            latitude = lastPosition.latitude,
                        )?.toList(),
                    lastPositionSentAt = lastPosition.dateTime.toInstant().toEpochMilli(),
                )
            }
    }
}
