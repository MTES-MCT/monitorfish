package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

data class PnoType(
    val id: Int,
    val name: String,
    val minimumNotificationPeriod: Double,
    val hasDesignatedPorts: Boolean,
    val pnoTypeRules: List<PnoTypeRule>,
) {
    fun toPriorNotificationType(): PriorNotificationType {
        return PriorNotificationType(
            hasDesignatedPorts,
            minimumNotificationPeriod,
            name,
        )
    }
}
