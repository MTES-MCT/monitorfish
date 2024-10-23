package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationSubscribersFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationSubscribersSortColumn
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber
import org.springframework.data.domain.Sort

@UseCase
class GetPriorNotificationSubscribers(
    private val controlUnitRepository: ControlUnitRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
) {
    fun execute(
        filter: PriorNotificationSubscribersFilter,
        sortColumn: PriorNotificationSubscribersSortColumn,
        sortDirection: Sort.Direction,
    ): List<PriorNotificationSubscriber> {
        val priorNotificationSubscribers = getPriorNotificationSubscribers()
        val filteredPriorNotificationSubscribers =
            filterPriorNotificationSubscribers(
                subscribers = priorNotificationSubscribers,
                filter = filter,
            )

        return sortPriorNotificationSubscribers(
            subscribers = filteredPriorNotificationSubscribers,
            sortColumn = sortColumn,
            sortDirection = sortDirection,
        )
    }

    private fun getPriorNotificationSubscribers(): List<PriorNotificationSubscriber> {
        return controlUnitRepository.findAll().map { controlUnit ->
            val portSubscriptions = pnoPortSubscriptionRepository.findByControlUnitId(controlUnit.id)
            val segmentSubscriptions = pnoSegmentSubscriptionRepository.findByControlUnitId(controlUnit.id)
            val vesselSubscriptions = pnoVesselSubscriptionRepository.findByControlUnitId(controlUnit.id)

            PriorNotificationSubscriber(
                controlUnit = controlUnit,
                portSubscriptions = portSubscriptions,
                segmentSubscriptions = segmentSubscriptions,
                vesselSubscriptions = vesselSubscriptions,
            )
        }
    }

    private fun filterPriorNotificationSubscribers(
        subscribers: List<PriorNotificationSubscriber>,
        filter: PriorNotificationSubscribersFilter,
    ): List<PriorNotificationSubscriber> {
        return subscribers.filter { subscriber ->
            val administrationIdMatches =
                filter.administrationId?.let {
                    subscriber.controlUnit.administration.id == it
                } != false

            val portLocodeMatches =
                filter.portLocode?.let {
                    subscriber.portSubscriptions.any { portSubscription -> portSubscription.portLocode == it }
                } != false

            val searchQueryMatches =
                filter.searchQuery?.let {
                    subscriber.controlUnit.name.contains(it, ignoreCase = true)
                } != false

            administrationIdMatches && portLocodeMatches && searchQueryMatches
        }
    }

    private fun sortPriorNotificationSubscribers(
        subscribers: List<PriorNotificationSubscriber>,
        sortColumn: PriorNotificationSubscribersSortColumn,
        sortDirection: Sort.Direction,
    ): List<PriorNotificationSubscriber> {
        val comparator =
            when (sortColumn) {
                PriorNotificationSubscribersSortColumn.NAME ->
                    compareBy<PriorNotificationSubscriber> { it.controlUnit.name }
            }

        return subscribers.sortedWith(
            if (sortDirection == Sort.Direction.ASC) comparator else comparator.reversed(),
        )
    }
}
