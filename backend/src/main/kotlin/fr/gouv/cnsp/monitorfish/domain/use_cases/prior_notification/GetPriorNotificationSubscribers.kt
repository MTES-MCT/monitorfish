package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationSubscribersFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationSubscribersSortColumn
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber
import fr.gouv.cnsp.monitorfish.utils.StringUtils
import org.springframework.data.domain.Sort

@UseCase
class GetPriorNotificationSubscribers(
    private val controlUnitRepository: ControlUnitRepository,
    private val fleetSegmentRepository: FleetSegmentRepository,
    private val pnoPortSubscriptionRepository: PnoPortSubscriptionRepository,
    private val pnoFleetSegmentSubscriptionRepository: PnoFleetSegmentSubscriptionRepository,
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
        val activeControlUnits = controlUnitRepository.findAll().filter { !it.isArchived }
        val allFleetSegmentSubscriptions = pnoFleetSegmentSubscriptionRepository.findAll()
        val allPortSubscriptions = pnoPortSubscriptionRepository.findAll()
        val allVesselSubscriptions = pnoVesselSubscriptionRepository.findAll()

        val allFleetSegments = fleetSegmentRepository.findAll()
        val allPorts = portRepository.findAll()
        val vessels = vesselRepository.findVesselsByIds(allVesselSubscriptions.map { it.vesselId }.distinct())

        return activeControlUnits.map { controlUnit ->
            val fleetSegmentSubscriptions =
                allFleetSegmentSubscriptions.filter { segmentSubscription ->
                    segmentSubscription.controlUnitId == controlUnit.id
                }
            val portSubscriptions =
                allPortSubscriptions.filter { portSubscription ->
                    portSubscription.controlUnitId == controlUnit.id
                }
            val vesselSubscriptions =
                allVesselSubscriptions.filter { vesselSubscription ->
                    vesselSubscription.controlUnitId == controlUnit.id
                }

            return@map PriorNotificationSubscriber.create(
                controlUnit,
                fleetSegmentSubscriptions,
                portSubscriptions,
                vesselSubscriptions,
                allFleetSegments,
                allPorts,
                allVessels = vessels,
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
                filter.searchQuery?.let { query ->
                    val normalizedQuery = StringUtils.removeAccents(query).lowercase()

                    val controlUnitNameMatches =
                        StringUtils.removeAccents(subscriber.controlUnit.name)
                            .lowercase()
                            .contains(normalizedQuery)

                    val administrationNameMatches =
                        StringUtils.removeAccents(subscriber.controlUnit.administration.name)
                            .lowercase()
                            .contains(normalizedQuery)

                    val portNameMatches =
                        subscriber.portSubscriptions.any { portSubscription ->
                            portSubscription.portName
                                ?.let(StringUtils::removeAccents)
                                ?.lowercase()
                                ?.contains(normalizedQuery) == true
                        }

                    controlUnitNameMatches || administrationNameMatches || portNameMatches
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
