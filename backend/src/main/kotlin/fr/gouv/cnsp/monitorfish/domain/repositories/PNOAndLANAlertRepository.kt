package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PNOAndLANAlert
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping

interface PNOAndLANAlertRepository {
    fun save(alert: PNOAndLANAlert)
    fun findAlertsOfTypes(
        types: List<AlertTypeMapping>,
        internalReferenceNumber: String,
        tripNumber: String,
    ): List<PNOAndLANAlert>
}
