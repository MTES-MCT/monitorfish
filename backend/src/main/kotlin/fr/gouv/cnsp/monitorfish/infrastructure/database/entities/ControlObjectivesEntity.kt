package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.control_objective.ControlObjective
import jakarta.persistence.*

@Entity
@Table(name = "control_objectives")
data class ControlObjectivesEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id", unique = true, nullable = false)
    val id: Int? = null,
    @Column(name = "facade")
    val facade: String,
    @Column(name = "segment")
    val segment: String? = null,
    @Column(name = "year")
    val year: Int? = null,
    @Column(name = "target_number_of_controls_at_sea")
    val targetNumberOfControlsAtSea: Int,
    @Column(name = "target_number_of_controls_at_port")
    val targetNumberOfControlsAtPort: Int,
    @Column(name = "control_priority_level")
    val controlPriorityLevel: Double,
) {

    fun toControlObjective() = ControlObjective(
        id = id,
        facade = facade,
        segment = segment,
        year = year,
        targetNumberOfControlsAtSea = targetNumberOfControlsAtSea,
        targetNumberOfControlsAtPort = targetNumberOfControlsAtPort,
        controlPriorityLevel = controlPriorityLevel,
    )

    companion object {
        fun fromControlObjective(controlObjective: ControlObjective): ControlObjectivesEntity {
            return ControlObjectivesEntity(
                facade = controlObjective.facade,
                segment = controlObjective.segment,
                year = controlObjective.year,
                targetNumberOfControlsAtSea = controlObjective.targetNumberOfControlsAtSea,
                targetNumberOfControlsAtPort = controlObjective.targetNumberOfControlsAtPort,
                controlPriorityLevel = controlObjective.controlPriorityLevel,
            )
        }
    }
}
