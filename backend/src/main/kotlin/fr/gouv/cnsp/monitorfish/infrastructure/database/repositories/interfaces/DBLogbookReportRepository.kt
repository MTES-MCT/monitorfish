package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.time.Instant

@DynamicUpdate
interface DBLogbookReportRepository :
    CrudRepository<LogbookReportEntity, Long>,
    JpaSpecificationExecutor<LogbookReportEntity> {
    @Query(
        """
        SELECT * FROM find_all_enriched_pno_references_and_related_operations(
            (:willArriveAfter)::TIMESTAMP WITHOUT TIME ZONE,
            (:willArriveBefore)::TIMESTAMP WITHOUT TIME ZONE,
            :flagStates,
            :isLessThanTwelveMetersVessel,
            :lastControlledAfter,
            :lastControlledBefore,
            :portLocodes,
            :searchQuery,
            :hasOneOrMoreReportings,
            :priorNotificationTypesAsSqlArrayString,
            :specyCodesAsSqlArrayString,
            :tripGearCodesAsSqlArrayString,
            :tripSegmentCodesAsSqlArrayString
        )
        """,
        nativeQuery = true,
    )
    fun findAllEnrichedPnoReferencesAndRelatedOperations(
        flagStates: String?,
        hasOneOrMoreReportings: Boolean?,
        isLessThanTwelveMetersVessel: Boolean?,
        lastControlledAfter: String?,
        lastControlledBefore: String?,
        portLocodes: String?,
        priorNotificationTypesAsSqlArrayString: String?,
        searchQuery: String?,
        specyCodesAsSqlArrayString: String?,
        tripGearCodesAsSqlArrayString: String?,
        tripSegmentCodesAsSqlArrayString: String?,
        willArriveAfter: String,
        willArriveBefore: String,
    ): List<LogbookReportEntity>

    /**
     * This query either returns:
     * - 1 element if the report id is found, not corrected and not deleted
     * - 0 element
     */
    @Query(
        "SELECT * FROM find_pno_by_report_id(:reportId, (:operationDate)::TIMESTAMP WITHOUT TIME ZONE)",
        nativeQuery = true,
    )
    fun findAcknowledgedNonDeletedPnoDatAndCorsByReportId(
        reportId: String,
        operationDate: String,
    ): List<LogbookReportEntity>

    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDate(
            e.tripNumber,
            MIN(e.operationDateTime)
        )
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = :internalReferenceNumber
        AND e.tripNumber IS NOT NULL
        AND e.operationType IN ('DAT', 'COR')
        AND NOT e.isTestMessage
        AND e.operationDateTime < (
        SELECT
            MIN(er.operationDateTime)
        FROM
            LogbookReportEntity er
        WHERE
            er.internalReferenceNumber = :internalReferenceNumber AND
            er.tripNumber = :tripNumber
        )
        GROUP BY e.tripNumber
        ORDER BY 2 DESC""",
    )
    fun findPreviousTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
        pageable: Pageable,
    ): List<VoyageTripNumberAndDate>

    /**
     * We filter the LAN to ensure we do not miss a trip if there is a trip is ended before the LAN of the previous trip is sent.
     * i.e, we want the "Trip 2" not to be missed:
     *
     *  [DEP, FAR, RTP,     ...LAN]                                  Trip 1 (current trip)
     *            [DEP, FAR, RTP]                                    Trip 2
     *                              [DEP, FAR, RTP,     ...LAN]      Trip 3
     *
     *  time ->
     */
    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDate(e.tripNumber, MAX(e.operationDateTime))
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = :internalReferenceNumber
        AND e.tripNumber IS NOT NULL
        AND e.tripNumber != :tripNumber
        AND e.operationType IN ('DAT', 'COR')
        AND NOT e.isTestMessage
        AND e.operationDateTime > (
            SELECT
                MAX(er.operationDateTime)
            FROM
                LogbookReportEntity er
            WHERE
                er.internalReferenceNumber = :internalReferenceNumber AND
                er.tripNumber = :tripNumber AND
                er.messageType != 'LAN'
        )
        GROUP BY e.tripNumber
        ORDER BY 2 ASC""",
    )
    fun findNextTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
        pageable: Pageable,
    ): List<VoyageTripNumberAndDate>

    @Query(
        """SELECT
            start_date,
            end_date,
            end_date_without_lan
        FROM find_dates_of_trip(:internalReferenceNumber, :tripNumber)""",
        nativeQuery = true,
    )
    fun findFirstAndLastOperationsDatesOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
    ): List<Array<Instant>>

    /**
     * The last `MAX(lr_all.operationDateTime)` date is used to display the fishing trip positions, hence LAN are excluded.
     */
    @Query(
        """SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDates(
            e.tripNumber,
            MIN(e.operationDateTime),
            MAX(e.operationDateTime),
            MAX(CASE WHEN messageType != 'LAN' THEN e.operationDateTime END)
        )
        FROM LogbookReportEntity e
        WHERE e.internalReferenceNumber = :internalReferenceNumber
        AND e.tripNumber IS NOT NULL
        AND e.operationType IN ('DAT', 'COR')
        AND e.operationDateTime <= :beforeDateTime
        AND NOT e.isTestMessage
        GROUP BY e.tripNumber
        ORDER BY 2 DESC""",
    )
    fun findTripsBeforeDatetime(
        internalReferenceNumber: String,
        beforeDateTime: Instant,
        pageable: Pageable,
    ): List<VoyageTripNumberAndDates>

    /**
     * Subqueries are required to get MIN and MAX date_time outside the clause :
     *  `e.operationDateTime BETWEEN :afterDateTime AND :beforeDateTime`
     *
     *  The last `MAX(lr_all.activityDateTime)` date is used to display the fishing trip positions, hence LAN are excluded.
     */
    @Query(
        """
        SELECT new fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.VoyageTripNumberAndDates(
            e.tripNumber,
            (SELECT MIN(lr_all.operationDateTime)
             FROM LogbookReportEntity lr_all
             WHERE
                lr_all.internalReferenceNumber = :internalReferenceNumber AND
                lr_all.tripNumber = e.tripNumber
             ),
            (SELECT MAX(lr_all.operationDateTime)
             FROM LogbookReportEntity lr_all
             WHERE
                lr_all.internalReferenceNumber = :internalReferenceNumber AND
                lr_all.tripNumber = e.tripNumber
             ),
             (SELECT MAX(lr_all.operationDateTime)
             FROM LogbookReportEntity lr_all
             WHERE
                lr_all.internalReferenceNumber = :internalReferenceNumber AND
                lr_all.tripNumber = e.tripNumber AND
                lr_all.messageType != 'LAN'
             )
    )
    FROM LogbookReportEntity e
    WHERE
        e.internalReferenceNumber = :internalReferenceNumber
        AND e.tripNumber IS NOT NULL
        AND e.operationType IN ('DAT', 'COR')
        AND e.operationDateTime BETWEEN :afterDateTime AND :beforeDateTime
        AND NOT e.isTestMessage
    GROUP BY e.tripNumber
    ORDER BY MIN(e.operationDateTime) DESC""",
    )
    fun findTripsBetweenDates(
        internalReferenceNumber: String,
        beforeDateTime: Instant,
        afterDateTime: Instant,
    ): List<VoyageTripNumberAndDates>

    @Query(
        """WITH dat_cor AS (
            SELECT *
            FROM logbook_reports e
            WHERE e.cfr = :internalReferenceNumber
            AND e.trip_number = :tripNumber
            AND operation_datetime_utc >= :startDate
            AND operation_datetime_utc <= :endDate
            AND NOT e.is_test_message
        ),
        ret AS (
            SELECT *
            FROM logbook_reports
            WHERE referenced_report_id IN (select report_id FROM dat_cor)
            AND operation_datetime_utc >= cast(:startDate AS TIMESTAMP) - INTERVAL '1 day'
            AND operation_datetime_utc <= cast(:endDate AS TIMESTAMP) + INTERVAL '3 days'
            AND operation_type = 'RET'
            AND NOT is_test_message
        )
        SELECT MIN(dc.operation_datetime_utc)
        FROM dat_cor dc
        LEFT OUTER JOIN ret r
            ON r.referenced_report_id = dc.report_id
            WHERE
                r.value->>'returnStatus' = '000' OR
                dc.transmission_format = 'FLUX'""",
        nativeQuery = true,
    )
    fun findFirstAcknowledgedDateOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
        startDate: Instant,
        endDate: Instant,
    ): Instant

    @Query(
        """
        SELECT *
        FROM find_logbook_by_trip_number(
            :internalReferenceNumber,
            (:afterDateTime)::TIMESTAMP WITHOUT TIME ZONE,
            (:beforeDateTime)::TIMESTAMP WITHOUT TIME ZONE,
            :tripNumber
        )""",
        nativeQuery = true,
    )
    fun findAllMessagesByTripNumberBetweenDates(
        internalReferenceNumber: String,
        afterDateTime: String,
        beforeDateTime: String,
        tripNumber: String,
    ): List<LogbookReportEntity>

    @Query(
        """
            select find_last_operation_datetime()
        """,
        nativeQuery = true,
    )
    fun findLastOperationDateTime(): Instant

    @Query(
        """
            SELECT find_last_operation_number(:internalReferenceNumber)
        """,
        nativeQuery = true,
    )
    fun findLastOperationNumber(internalReferenceNumber: String): String?

    @Query(
        """
            SELECT find_last_software(:internalReferenceNumber)
        """,
        nativeQuery = true,
    )
    fun findLastReportSoftware(internalReferenceNumber: String): String?

    @Query(
        """SELECT distinct e.trip_number
        FROM logbook_reports e
        WHERE e.cfr = :internalReferenceNumber
        AND e.trip_number IS NOT NULL
        AND e.operation_type IN ('DAT', 'COR')
        AND NOT e.is_test_message
        AND e.operation_datetime_utc > now() - interval '3 year'
        ORDER BY e.trip_number DESC
    """,
        nativeQuery = true,
    )
    fun findLastThreeYearsTripNumbers(internalReferenceNumber: String): List<String>

    @Query(
        """
        SELECT DISTINCT jsonb_array_elements(value->'pnoTypes')->>'pnoTypeName' AS uniquePnoTypeName
        FROM logbook_reports
        WHERE log_type = 'PNO'
        AND operation_datetime_utc > now() - interval '2 year'
        ORDER BY uniquePnoTypeName
        """,
        nativeQuery = true,
    )
    fun findDistinctPriorNotificationType(): List<String>?

    @Query(
        """
        SELECT DISTINCT
            cfr
        FROM
            logbook_reports
        WHERE
            (software LIKE 'JT%' OR software LIKE 'FT%') AND
            operation_datetime_utc >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '12 months'
        """,
        nativeQuery = true,
    )
    fun findAllCfrWithVisioCaptures(): List<String>
}
