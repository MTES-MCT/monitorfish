package fr.gouv.cnsp.monitorfish.infrastructure.cache

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.clearInvocations
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetActiveVessels
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetActiveVesselsWithoutVesselGroups
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.GetAllUserVesselGroups
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.junit.jupiter.SpringExtension

/**
 * Every user polls the active vessels every 5 minutes: the data shared by all users must not be computed
 * again for each user (it costs seconds with the production volumes).
 */
@ExtendWith(SpringExtension::class)
@ContextConfiguration(
    classes = [
        CaffeineConfiguration::class,
        GetActiveVessels::class,
        GetActiveVesselsWithoutVesselGroups::class,
        RefreshActiveVesselsCache::class,
    ],
)
class ActiveVesselsCacheUTests {
    @MockitoBean
    private lateinit var lastPositionRepository: LastPositionRepository

    @MockitoBean
    private lateinit var reportingRepository: ReportingRepository

    @MockitoBean
    private lateinit var getAllUserVesselGroups: GetAllUserVesselGroups

    @MockitoBean
    private lateinit var logbookReportRepository: LogbookReportRepository

    @MockitoBean
    private lateinit var manualPriorNotificationRepository: ManualPriorNotificationRepository

    @Autowired
    private lateinit var getActiveVessels: GetActiveVessels

    @Autowired
    private lateinit var refreshActiveVesselsCache: RefreshActiveVesselsCache

    @Autowired
    private lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.cacheNames.forEach { cacheManager.getCache(it)?.clear() }
    }

    @Test
    fun `execute Should compute the data shared by all users only once`() {
        // When
        getActiveVessels.execute("first.user@gouv.fr")
        getActiveVessels.execute("second.user@gouv.fr")

        // Then
        verify(lastPositionRepository, times(1)).findActiveVesselWithReferentialData(any())
        verify(reportingRepository, times(1)).findAllCurrent()
        verify(manualPriorNotificationRepository, times(1)).findAllForActiveVessels()
        verify(logbookReportRepository, times(1)).findAllAcknowledgedPriorNotificationsForActiveVessels()
        // The vessel groups depend on the user
        verify(getAllUserVesselGroups, times(2)).execute(any())
    }

    @Test
    fun `execute Should not wait for the computation of the active vessels once refreshed ahead`() {
        // Given
        refreshActiveVesselsCache.execute()
        clearInvocations(lastPositionRepository, reportingRepository, logbookReportRepository)

        // When
        getActiveVessels.execute("first.user@gouv.fr")
        getActiveVessels.execute("second.user@gouv.fr")

        // Then
        verify(lastPositionRepository, never()).findActiveVesselWithReferentialData(any())
        verify(reportingRepository, never()).findAllCurrent()
        verify(logbookReportRepository, never()).findAllAcknowledgedPriorNotificationsForActiveVessels()
    }

    @Test
    fun `refresh Should replace the active vessels shared by all users`() {
        // Given
        getActiveVessels.execute("first.user@gouv.fr")

        // When
        refreshActiveVesselsCache.execute()
        refreshActiveVesselsCache.execute()

        // Then
        verify(reportingRepository, times(3)).findAllCurrent()
    }
}
