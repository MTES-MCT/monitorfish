package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "recent_positions_metrics")
data class RecentPositionsMetricsEntity(
    @Id
    @Column(name = "id")
    val id: Int,
    @Column(name = "reference_positions_per_hour_french_vessels")
    val reference_positions_per_hour_french_vessels: Double,
    @Column(name = "threshold")
    val threshold: Double,
    @Column(name = "last_hour_positions_french_vessels")
    val last_hour_positions_french_vessels: Int,
    @Column(name = "sudden_drop_of_positions_received")
    val suddenDropOfPositionsReceived: Boolean,
)
