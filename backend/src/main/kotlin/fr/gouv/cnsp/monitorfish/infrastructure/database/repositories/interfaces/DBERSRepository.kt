package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.ERSEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.sql.Timestamp
import java.time.Instant

@DynamicUpdate
interface DBERSRepository : CrudRepository<ERSEntity, Long>, JpaSpecificationExecutor<ERSEntity> {
    /**
     * 1. In `trip_numbers`, we first select all trip numbers between a range (with 6 months added before and after), then we order them by dates and
     *  we save the row number of the order
     *
     *  i.e:
     *   trip_number | first_message_datetime | rank
     *  -------------+------------------------+------
     *       9463713 | 2019-01-18 11:45:00    |    1
     *       9463713 | 2019-01-23 13:08:00    |    2
     *       9463714 | 2019-02-17 01:05:00    |    3
     *       9463714 | 2019-02-27 01:05:00    |    4
     *       9463714 | 2019-04-03 10:15:00    |    5
     *
     * 2. In `current_trip_row_number`, we select the current trip row number
     * 3. Finally, we select the trip number before the current trip row number (in the ordered list)
     */
    @Query( "WITH trip_numbers AS (" +
            "   SELECT " +
            "       e.trip_number as trip_number," +
            "       MIN(e.operation_datetime_utc) as first_message_datetime," +
            "       row_number() OVER (ORDER BY e.operation_datetime_utc ASC) as rank" +
            "   FROM ers e" +
            "   WHERE " +
            "        e.cfr = ?1 AND " +
            "        e.trip_number IS NOT NULL AND " +
            "        e.operation_type IN ('DAT', 'COR') AND " +
            "        e.operation_datetime_utc >= (" +
            "           SELECT operation_datetime_utc " +
            "           FROM ers " +
            "           WHERE trip_number = ?2" +
            "           ORDER BY operation_datetime_utc ASC" +
            "           LIMIT 1) - INTERVAL '6 months' AND " +
            "        e.operation_datetime_utc <= (" +
            "           SELECT operation_datetime_utc " +
            "           FROM ers " +
            "           WHERE trip_number = ?2" +
            "           ORDER BY operation_datetime_utc DESC" +
            "           LIMIT 1) + INTERVAL '6 months' " +
            "   GROUP BY e.trip_number, e.operation_datetime_utc " +
            "   ORDER BY 2 ASC), " +
            "current_trip_row_number AS (" +
            "   SELECT rank" +
            "   FROM trip_numbers " +
            "   WHERE trip_number = ?2 LIMIT 1) " +
            "SELECT trip_number, rank " +
            "FROM trip_numbers " +
            "WHERE rank < (SELECT current.rank FROM current_trip_row_number current) " +
            "ORDER BY rank DESC LIMIT 1", nativeQuery = true)
    fun findPreviousTripNumber(internalReferenceNumber: String, tripNumber: Int): Int

    /**
     * 1. In `trip_numbers`, we first select all trip numbers between a range (with 6 months added before and after), then we order them by dates and
     *  we save the row number of the order
     *  
     *  i.e:
     *   trip_number | first_message_datetime | rank
     *  -------------+------------------------+------
     *       9463713 | 2019-01-18 11:45:00    |    1
     *       9463713 | 2019-01-23 13:08:00    |    2
     *       9463714 | 2019-02-17 01:05:00    |    3
     *       9463714 | 2019-02-27 01:05:00    |    4
     *       9463714 | 2019-04-03 10:15:00    |    5
     *
     * 2. In `current_trip_row_number`, we select the current trip row number ordered by rank DESC to make sure
     * to select the last date of the current trip
     * 3. Finally, we select the trip number after the current trip row number (in the ordered list)
     */
    @Query( "WITH trip_numbers AS (" +
            "   SELECT " +
            "       e.trip_number as trip_number," +
            "       MIN(e.operation_datetime_utc) as first_message_datetime," +
            "       row_number() OVER (ORDER BY e.operation_datetime_utc ASC) as rank" +
            "   FROM ers e" +
            "   WHERE " +
            "        e.cfr = ?1 AND " +
            "        e.trip_number IS NOT NULL AND " +
            "        e.operation_type IN ('DAT', 'COR') AND " +
            "        e.operation_datetime_utc >= (" +
            "           SELECT operation_datetime_utc " +
            "           FROM ers " +
            "           WHERE trip_number = ?2" +
            "           ORDER BY operation_datetime_utc ASC" +
            "           LIMIT 1) - INTERVAL '6 months' AND " +
            "        e.operation_datetime_utc <= (" +
            "           SELECT operation_datetime_utc " +
            "           FROM ers " +
            "           WHERE trip_number = ?2" +
            "           ORDER BY operation_datetime_utc DESC" +
            "           LIMIT 1) + INTERVAL '6 months' " +
            "   GROUP BY e.trip_number, e.operation_datetime_utc " +
            "   ORDER BY 2 ASC), " +
            "current_trip_row_number AS (" +
            "   SELECT rank" +
            "   FROM trip_numbers " +
            "   WHERE trip_number = ?2 " +
            "   ORDER BY rank DESC LIMIT 1) " +
            "SELECT trip_number, rank " +
            "FROM trip_numbers " +
            "WHERE rank > (SELECT current.rank FROM current_trip_row_number current) " +
            "ORDER BY rank DESC LIMIT 1", nativeQuery = true)
    fun findNextTripNumber(internalReferenceNumber: String, tripNumber: Int): Int

    @Query("SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageDates(MIN(e.operationDateTime), MAX(e.operationDateTime)) " +
            "FROM ERSEntity e WHERE e.internalReferenceNumber = ?1 AND e.tripNumber = ?2")
    fun findFirstAndLastOperationsDatesOfTrip(internalReferenceNumber: String, tripNumber: Int) : VoyageDates

    @Query( "SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageInstantsAndTripNumber(e.tripNumber, MIN(e.operationDateTime), MAX(e.operationDateTime)) " +
            "FROM ERSEntity e " +
            "WHERE e.internalReferenceNumber = ?1 " +
            "AND e.tripNumber IS NOT NULL " +
            "AND e.operationType IN ('DAT', 'COR') " +
            "AND e.operationDateTime <= ?2 " +
            "GROUP BY e.tripNumber " +
            "ORDER BY 2 DESC ")
    fun findTripsBeforeDatetime(internalReferenceNumber: String, beforeDateTime: Instant, pageable: Pageable): List<VoyageInstantsAndTripNumber>

    @Query("WITH dat_cor AS (" +
            "   SELECT * " +
            "   FROM ers " +
            "   WHERE " +
            "       operation_datetime_utc >= ?2 AND " +
            "       operation_datetime_utc <= ?3 AND " +
            "       cfr = ?1 AND " +
            "       trip_number = ?4 AND " +
            "       operation_type IN ('DAT', 'COR') " +
            "   ORDER BY operation_datetime_utc DESC" +
            "), " +
            "ret AS (" +
            "   select * " +
            "   FROM ers " +
            "   WHERE " +
            "       referenced_ers_id IN (select ers_id FROM dat_cor) AND " +
            "       operation_datetime_utc + INTERVAL '1 day' >= ?2 AND " +
            "       operation_datetime_utc - INTERVAL '1 day' < ?3 AND " +
            "       operation_type = 'RET' " +
            "   ORDER BY operation_datetime_utc DESC" +
            "), " +
            "del AS (" +
            "   SELECT * " +
            "   FROM ers " +
            "   WHERE " +
            "       referenced_ers_id IN (select ers_id FROM dat_cor) AND " +
            "       operation_datetime_utc >= ?2 AND " +
            "       operation_datetime_utc - INTERVAL '1 week' < ?3 AND " +
            "       operation_type = 'DEL' " +
            "   ORDER BY operation_datetime_utc desc" +
            ") " +
            "SELECT * " +
            "FROM dat_cor " +
            "UNION ALL SELECT * from ret " +
            "UNION ALL SELECT * from del", nativeQuery = true)
    fun findAllMessagesByTripNumberBetweenDates(internalReferenceNumber: String, afterDateTime: Instant, beforeDateTime: Instant, tripNumber: Int): List<ERSEntity>

    @Query("select operation_datetime_utc from ers where operation_datetime_utc < now() order by operation_datetime_utc desc limit 1", nativeQuery = true)
    fun findLastOperationDateTime(): Instant

    @Query("select * from ers where ers_id in " +
            "(select distinct referenced_ers_id from ers where operation_type = 'RET' and value->>'returnStatus' = '000') " +
            "and (log_type = 'LAN' or log_type = 'PNO') " +
            "and (:ruleType <> ANY(analyzed_by_rules) or analyzed_by_rules is null)", nativeQuery = true)
    fun findAllLANAndPNONotProcessedByRule(ruleType: String): List<ERSEntity>

    @Modifying(clearAutomatically = true)
    @Query("update ers set analyzed_by_rules = array_append(analyzed_by_rules, :ruleType) where id in (:ids)", nativeQuery = true)
    fun updateERSMessagesAsProcessedByRule(ids: List<Long>, ruleType: String)
}
