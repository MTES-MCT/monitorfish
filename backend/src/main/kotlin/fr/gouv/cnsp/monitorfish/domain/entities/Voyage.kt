package fr.gouv.cnsp.monitorfish.domain.entities

import java.time.ZonedDateTime

data class Voyage(
        val isLastVoyage: Boolean,
        val startDate: ZonedDateTime?,
        val endDate: ZonedDateTime?,
        val ersMessagesAndAlerts: ERSMessagesAndAlerts)