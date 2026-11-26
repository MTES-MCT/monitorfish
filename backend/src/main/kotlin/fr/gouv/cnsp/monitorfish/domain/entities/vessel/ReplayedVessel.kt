package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.entities.producer_organization.ProducerOrganizationMembership

/**
 * A vessel as it was at a past date: its position at that date, its stable identity and producer organization only.
 *
 * Risk factor, segments, gears, species, controls and alerts are not historized, so they are deliberately absent.
 */
data class ReplayedVessel(
    val position: Position,
    val vessel: Vessel?,
    val producerOrganization: ProducerOrganizationMembership? = null,
)
