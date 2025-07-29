package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.activity.ActivityVisualization
import jakarta.persistence.*
import java.time.Instant
import java.time.ZoneOffset

@Entity
@Table(name = "activity_visualizations")
data class ActivityVisualizationEntity(
    @Column(name = "start_datetime_utc")
    val startDatetimeUtc: Instant,
    @Id
    @Column(name = "end_datetime_utc")
    val endDatetimeUtc: Instant,
    @Column(name = "html_file")
    val html: String,
) {
    fun toActivityVisualization() =
        ActivityVisualization(
            startDatetimeUtc = startDatetimeUtc.atZone(ZoneOffset.UTC),
            endDatetimeUtc = endDatetimeUtc.atZone(ZoneOffset.UTC),
            html = html,
        )
}
