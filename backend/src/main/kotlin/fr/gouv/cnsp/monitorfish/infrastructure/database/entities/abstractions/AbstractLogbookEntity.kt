package fr.gouv.cnsp.monitorfish.infrastructure.database.entities.abstractions

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType
import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import org.hibernate.annotations.Type

@MappedSuperclass
abstract class AbstractLogbookEntity(
    @Column(name = "cfr")
    open val cfr: String?,

    /** ISO Alpha-3 country code. */
    @Column(name = "flag_state")
    open val flagState: String?,

    @Column(name = "trip_gears", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    open val tripGears: List<LogbookTripGear>?,

    @Column(name = "trip_segments", nullable = true, columnDefinition = "jsonb")
    @Type(JsonBinaryType::class)
    open val tripSegments: List<LogbookTripSegment>?,

    @Column(name = "vessel_name")
    open val vesselName: String?,
)
