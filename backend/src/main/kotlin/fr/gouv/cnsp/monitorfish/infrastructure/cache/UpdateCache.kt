package fr.gouv.cnsp.monitorfish.infrastructure.cache

import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.slf4j.LoggerFactory
import org.springframework.cache.CacheManager
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Component
class UpdateCache(
    private val logbookReportRepository: LogbookReportRepository,
    private val cacheManager: CacheManager,
) {
    private val logger = LoggerFactory.getLogger(UpdateCache::class.java)

    // At every 2 days, after 1 minute of initial delay
    @Scheduled(fixedDelay = 173000000, initialDelay = 6000)
    fun execute() {
        cacheManager.getCache("all_visiocaptures_vessels")?.invalidate()

        logbookReportRepository.findAllCfrWithVisioCaptures()

        logger.info("Updated 'all_visiocaptures_vessels' cache.")
    }
}
