package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.ControlObjective
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "control_objectives")
data class ControlObjectivesEntity(
        @Id
        @Column(name = "id")
        val id: Int,
        @Column(name = "facade")
        val facade: String? = null,
        @Column(name = "segment")
        val segment: String? = null,
        @Column(name = "year")
        val year: Int? = null,
        @Column(name = "target_number_of_controls_at_sea")
        val targetNumberOfControlsAtSea: Int,
        @Column(name = "target_number_of_controls_at_port")
        val targetNumberOfControlsAtPort: Int,
        @Column(name = "control_priority_level")
        val controlPriorityLevel: Double) {

        fun toControlObjective() = ControlObjective(
                id = id,
                facade = facade,
                segment = segment,
                year = year,
                targetNumberOfControlsAtSea = targetNumberOfControlsAtSea,
                targetNumberOfControlsAtPort = targetNumberOfControlsAtPort,
                controlPriorityLevel = controlPriorityLevel
        )
}
