package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Controller
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "controllers")
data class ControllerEntity(
    @Id
    @Column(name = "id")
    var id: Int,
    @Column(name = "controller")
    var controller: String? = null,
    @Column(name = "controller_type")
    var controllerType: String? = null,
    @Column(name = "administration")
    var administration: String? = null
) {

    fun toController() = Controller(
        id = id,
        controller = controller,
        controllerType = controllerType,
        administration = administration
    )
}
