package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.SilencedAlertEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.ZonedDateTime

@DynamicUpdate
interface DBSilencedAlertRepository : CrudRepository<SilencedAlertEntity, Int> {
    fun findAllBySilencedBeforeDateAfter(date: ZonedDateTime): List<SilencedAlertEntity>

    @Modifying
    @Query(
        """
        DELETE FROM
            silenced_alerts
        WHERE
            silenced_before_date < NOW() - INTERVAL '6 months'
    """,
        nativeQuery = true,
    )
    fun deleteSixMonthsOldSilencedAlerts()
}
