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
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoSegmentSubscriptionRepository: PnoSegmentSubscriptionRepository,
    private val pnoVesselSubscriptionRepository: PnoVesselSubscriptionRepository,
    private val portRepository: PortRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(
        filter: PriorNotificationSubscribersFilter,
        sortColumn: PriorNotificationSubscribersSortColumn,
        sortDirection: Sort.Direction,
    ): List<PriorNotificationSubscriber> {
        val priorNotificationSubscribers = getPriorNotificationSubscribers()
        val filteredPriorNotificationSubscribers =
            filterPriorNotificationSubscribers(subscribers = priorNotificationSubscribers, filter = filter)

        return sortPriorNotificationSubscribers(
            subscribers = filteredPriorNotificationSubscribers,
            sortColumn = sortColumn,
            sortDirection = sortDirection,
        )
    }

    private fun getPriorNotificationSubscribers(): List<PriorNotificationSubscriber> {
        val allFleetSegments = fleetSegmentRepository.findAll()
        val allPorts = portRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val allControlUnits = controlUnitRepository.findAll()
        val allPortSubscriptions = pnoPortSubscriptionRepository.findAll()
        val allSegmentSubscriptions = pnoSegmentSubscriptionRepository.findAll()
        val allVesselSubscriptions = pnoVesselSubscriptionRepository.findAll()

        return allControlUnits.map { controlUnit ->
            val portSubscriptions =
                allPortSubscriptions.filter { portSubscription ->
                    portSubscription.controlUnitId == controlUnit.id
                }
            val segmentSubscriptions =
                allSegmentSubscriptions.filter { segmentSubscription ->
                    segmentSubscription.controlUnitId == controlUnit.id
                }
            val vesselSubscriptions =
                allVesselSubscriptions.filter { vesselSubscription ->
                    vesselSubscription.controlUnitId == controlUnit.id
                }

            return@map PriorNotificationSubscriber.create(
                controlUnit,
                portSubscriptions,
                segmentSubscriptions,
                vesselSubscriptions,
                allFleetSegments,
                allPorts,
                allVessels,
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
                    subscriber.controlUnit.name.contains(it, ignoreCase = true) ||
                        subscriber.controlUnit.administration.name.contains(it, ignoreCase = true) ||
                        subscriber.portSubscriptions.any { portSubscription ->
                            portSubscription.portName?.contains(
                                it,
                                ignoreCase = true,
                            ) == true
                        }
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
                PriorNotificationSubscribersSortColumn.CONTROL_UNIT_NAME ->
                    compareBy<PriorNotificationSubscriber> { it.controlUnit.name }
            }

        return subscribers.sortedWith(
            if (sortDirection == Sort.Direction.ASC) comparator else comparator.reversed(),
        )
    }
}
